Ext.define('Yamma.utils.grid.YammaStoreList', {

	extend : 'Bluexml.utils.alfresco.grid.AlfrescoStoreList',
	
	requires : [
		'Yamma.store.YammaStoreFactory'
	],
	
	getStoreFactory : function() {
		return Yamma.store.YammaStoreFactory;
	}	
	
	
});