Ext.require(
	[
	 'Bluedolmen.store.AlfrescoStoreFactory', 
	 'Bluedolmen.store.AlfrescoTreeStore'
	],
function() {
	
Ext.define('Yamma.utils.grid.StoreTreePanel', {

	extend : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreTreePanel',
	
	statics : {
		
		storeFactory : Ext.create('Bluedolmen.store.AlfrescoStoreFactory', {
			appId : 'yamma',
			storeTypeName : 'Bluedolmen.store.AlfrescoTreeStore'
		})
		
	},
	
	getStoreFactory : function() {
		
		return Yamma.utils.grid.StoreTreePanel.storeFactory;
		
	}
	
});		
	
});
