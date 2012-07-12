Ext.define('Yamma.store.YammaStoreFactory', {

	extend : 'Bluexml.store.AlfrescoStoreFactory',
	singleton : true,
	
	constructor : function() {
		this.callParent([{
			appId : 'yamma'
		}]);
	}
	
});