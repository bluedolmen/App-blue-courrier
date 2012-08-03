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
 		
 		currentStore.removeAll(silent);
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
				
					me.currentStore = store;
	    			me.onStoreAvailable(store);
	    			
				},
				
				storeConfig : storeConfigOptions,
				
				proxyConfig : proxyConfigOptions,
				
				derivedFields : me.getDerivedFields(),
				
				onFieldDefinitionRetrieved : me.updateFieldDefinition
		    }
		);
 		
 	},
 	
 	onStoreAvailable : function(store) {
 		
    	store.load();
 		
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