Ext.define('Yamma.view.charts.AlfrescoStoreChart', {

	extend : 'Ext.chart.Chart',
	alias : 'widget.alfrescostorechart',
	
	requires : [
		'Yamma.store.YammaStoreFactory'
	],	
	
	mixins : {
		alfrescostoreaware : 'Bluexml.store.AlfrescoStoreAware'
	},
	
    store : Ext.create('Ext.data.ArrayStore'), // fake initial store
    
    initComponent : function() {
    	
    	this.series = this.getSeriesDefinition() || [];
    	this.callParent(arguments);
    },
    
    getSeriesDefinition : function() {
    	return [];
    },    
	
	
 	onStoreAvailable : function(store) {
 		
 		var me = this;
 		
 		me.bindStore(store);
 		store.load(function(records) {
 			me.onStoreLoaded(records); 
 		});
 		
 	},

 	onStoreLoaded : function(records) {
 		// do nothing
 	},
 	
 	getDerivedFields : function() {
 		
 		var me = this;
 		return [
 		
	 		{
	 			name : 'title',
	 			convert : function(value, record) {
	 				var title = me.getTitleLabel(record);
	 				if (null == title) return value;
	 				return title;
	 			}
	 		}
 		
 		];
 		
 	},
 	
 	getTitleLabel : function(record) {
 		return null;
 	}
	
});