Ext.define('Yamma.store.YammaStoreFactory', {

	extend : 'Bluexml.store.AlfrescoStoreFactory',
	
	constructor : function() {
		this.callParent([{
			appId : 'yamma'
		}]);
	}
	
});