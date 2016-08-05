Ext.define('Yamma.view.charts.YammaStoreChart', {

	extend : 'Yamma.view.charts.AlfrescoStoreChart',
	
	requires : [
		'Yamma.store.YammaStoreFactory'
	],
	
	getStoreFactory : function() {
		return Yamma.store.YammaStoreFactory;
	}	
	
});