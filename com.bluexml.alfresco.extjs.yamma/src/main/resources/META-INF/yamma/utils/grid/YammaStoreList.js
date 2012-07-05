Ext.define('Yamma.utils.grid.YammaStoreList', {

	extend : 'Bluexml.utils.alfresco.grid.AlfrescoStoreList',
	
	requires : [
		'Yamma.store.YammaStoreFactory'
	],
	
	statics : {
		YAMMA_STORE_FACTORY_INSTANCE : Ext.create('Yamma.store.YammaStoreFactory')  
	},
	
	getStoreFactory : function() {
		return Yamma.utils.grid.YammaStoreList.YAMMA_STORE_FACTORY_INSTANCE;
	}	
	
	
});