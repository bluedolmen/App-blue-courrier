Ext.define('Bluedolmen.store.AlfrescoStoreAware', {
	
	requires : [
		'Bluedolmen.store.AlfrescoStoreFactory'
	],
	
	storeId : '', // should be overridden
	storeConfigOptions : null, // default options that will be applied to store configuration (if not overridden)
	proxyConfigOptions :  null, // default options that will be applied to proxy configuration (if not overridden)
	
	currentStore : null,
	
 	load : function(storeConfigOptions, proxyConfigOptions) {
 		
 		var me = this;
 		storeConfigOptions = storeConfigOptions || {};
 		if (me.storeConfigOptions) Ext.applyIf(storeConfigOptions, me.storeConfigOptions);
 		
 		proxyConfigOptions = proxyConfigOptions || {};
 		if (me.proxyConfigOptions) Ext.applyIf(proxyConfigOptions, me.proxyConfigOptions);
 		
 		this.refreshStore(storeConfigOptions, proxyConfigOptions);
 		
 	}, 	
 	
 	/**
 	 * Refresh the current store if any
 	 */
 	refresh : function() {
 		
 		var currentStore = this.currentStore;
 		
 		if (!currentStore) {
 			this.load();
 			return;
 		}
 		
 		this.setLoading(true, true);
 		currentStore.load();
 		
 	},
 	
 	/**
	 * Clear the current embedded store
	 * 
	 * @param {Boolean}
	 *            silent Prevent the `clear` event from being fired.
	 */
 	clearStore : function(silent) {
 		
 		if (null == this.currentStore) return;
 		
 		this.currentStore.removeAll(silent);
 		this.currentStore = null;
 		
 		this.fireEvent('storecleared');
 		
 	},
 	
 	/**
 	 * @private
 	 * @param {} storeConfigOptions
 	 * @param {} proxyConfigOptions
 	 */
 	refreshStore : function(storeConfigOptions, proxyConfigOptions) {
 		
 		var 
 			me = this,
			storeFactory = this.getStoreFactory(),
			storeId = me.storeId
		;
		if (!storeFactory) 
			Ext.Error.raise('IllegalStateException! The store-factory is not correctly set. It should return a valid instance of AlfrescoStoreFactory'); 

		// Process dynamic store-id: only used for specific needs since the
		// new storeId is not reused upon successive refresh...
		if (storeConfigOptions && storeConfigOptions.storeId) {
			storeId = storeConfigOptions.storeId;
			delete storeConfigOptions.storeId;
		}
		
		this.setError(null);
		
		this.setLoading('Chargement', true);
		if (false === this.fireEvent('beforeload', me.currentStore, storeConfigOptions, proxyConfigOptions)) return;
		
	    storeFactory.requestNew({
	    	
	 		storeId : storeId,
	 		
	 		onStoreCreated : function(store) {
			
	 			var previousStore = me.currentStore;
				me.currentStore = store;
				
    			me.onStoreAvailable(store, previousStore);
    			
			},
			
			onFailure : function(response) {
				me.setError(true);
				me.setLoading(false);
			},
			
			storeConfig : storeConfigOptions,
			
			proxyConfig : proxyConfigOptions,
			
			derivedFields : me.getDerivedFields(),
			
			onFieldDefinitionRetrieved : me.updateFieldDefinition
			
	    });
 		
 	},
 	
 	onStoreAvailable : function(store, previousStore) {
 		
 		if (null != previousStore) {
 			this.mun(store, 'load', this._onStoreLoaded, this);
 		}
 		
 		this.mon(store, 'load', this._onStoreLoaded, this);
    	store.load();    		
    	
 	},
 	
 	/**
 	 * @param {} store
 	 * @param {} records
 	 * @param {} successful
 	 * @private
 	 */
 	_onStoreLoaded : function(store, records, successful) {
 		
 		var me = this;
 		
 		function onStoreLoaded() {
 			
 	 		if (!successful) return;
 	 		
 	    	var 
 	    		proxy = store.getProxy(),
 	    		reader = proxy ? proxy.reader : null,
 	    		metaData = reader ? reader.metaData : null
 	    	;
 	    	
 	    	me.onMetaDataRetrieved(metaData || {});
 	    	
 	    	if (false === me.fireEvent('storeloaded', store, records, successful)) {
 	    		return false;
 	    	}
 	    	
 	    	return me.onStoreLoaded(store, records, successful);
 			
 		}
 		
 		var result = onStoreLoaded();
 		this.setLoading(false);
		return result; 		
    	
 	},
 	
 	onStoreLoaded : function(store, records, successful) {
 		// do nothing
 		return true;
 	},
 	
 	onMetaDataRetrieved : function(metaData) {
 		// do nothing
 	},
 	
 	getStoreFactory : function() {
 		
 		Ext.Error.raise('UnsupportedOperationException! This method should be overridden by a subclass');
 		
 	},
 	
 	getDerivedFields : function() {
 		
 		return null;
 		
 	},
 	
 	updateFieldDefinition : function(fieldId, fieldDefinition) {
 		// do nothing
 	},
 	
 	setError : function(message, target) {
 		
 		target = target || this;
 		
 		if (null == message) { // no more error
 			if (target.isDisabled()) {
 				target.setDisabled(false);
 			}
 			return;
 		}
 		
 		target.setDisabled(true);
 		
 	}
	
});