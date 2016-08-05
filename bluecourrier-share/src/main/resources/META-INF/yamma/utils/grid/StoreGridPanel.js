Ext.define('Yamma.utils.grid.StoreGridPanel', {

	extend : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreGridPanel',
	
	requires : [
		'Yamma.store.YammaStoreFactory'
	],
	
	getStoreFactory : function() {
		return Yamma.store.YammaStoreFactory;
	}
	
});