Ext.define('Yaecma.store.StoreFactory', {

	extend : 'Bluedolmen.store.AlfrescoStoreFactory',
	singleton : true,
	
	constructor : function() {
		this.callParent([{
			appId : 'yaecma'
		}]);
	}
	
});