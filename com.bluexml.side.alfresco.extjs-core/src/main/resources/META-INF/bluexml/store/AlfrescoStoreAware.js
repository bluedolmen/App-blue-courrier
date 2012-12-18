Ext.define('Bluexml.store.AlfrescoStoreAware', {
	
	requires : [
		'Bluexml.store.AlfrescoStoreFactory'
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
 		
 	},
 	
 	/**
 	 * @private
 	 * @param {} storeConfigOptions
 	 * @param {} proxyConfigOptions
 	 */
 	refreshStore : function(storeConfigOptions, proxyConfigOptions) {
 		
 		var me = this;
		var storeFactory = this.getStoreFactory();
		if (!storeFactory) 
			Ext.Error.raise('IllegalStateException! The store-factory is not correctly set. It should return a valid instance of AlfrescoStoreFactory'); 
		
	    storeFactory.requestNew(
		    {
		 		storeId : me.storeId,
		 		
		 		onStoreCreated : function(store) {
				
		 			var previousStore = me.currentStore;
					me.currentStore = store;
					
	    			me.onStoreAvailable(store, previousStore);
	    			
				},
				
				storeConfig : storeConfigOptions,
				
				proxyConfig : proxyConfigOptions,
				
				derivedFields : me.getDerivedFields(),
				
				onFieldDefinitionRetrieved : me.updateFieldDefinition
		    }
		);
 		
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
 		
 		if (!successful) return;
 		
    	var 
    		proxy = store.getProxy(),
    		reader = proxy ? proxy.reader : null,
    		metaData = reader ? reader.metaData : null
    	;
    	
    	this.onMetaDataRetrieved(metaData || {}); 		
 	},
 	
 	onMetaDataRetrieved : function(metaData) {
 		
 	},
 	
 	getStoreFactory : function() {
 		
 		Ext.Error.raise('UnsupportedOperationException! This method should be overridden by a subclass');
 		
 	},
 	
 	getDerivedFields : function() {
 		
 		return null;
 		
 	},
 	
 	updateFieldDefinition : function(fieldId, fieldDefinition) {
 		// do nothing
 	}
	
});