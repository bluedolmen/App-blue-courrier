Ext.define('Yaecma.utils.grid.StoreGridPanel', {

	extend : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreGridPanel',
	
	uses : [
		'Yaecma.store.StoreFactory'
	],
	
	getStoreFactory : function() {
		return Yaecma.store.StoreFactory;
	}	
	
	
});