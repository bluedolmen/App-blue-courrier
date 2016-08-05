Ext.define('Yamma.store.YammaStoreFactory', {

	extend : 'Bluedolmen.store.AlfrescoStoreFactory',
	singleton : true,
	
	constructor : function() {
		this.callParent([{
			appId : 'yamma'
		}]);
	}
	
});