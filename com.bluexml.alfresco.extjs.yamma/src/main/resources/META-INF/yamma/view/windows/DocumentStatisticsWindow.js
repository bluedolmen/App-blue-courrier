Ext.define('Yamma.view.windows.DocumentStatisticsWindow', {
	
	extend : 'Ext.window.Window',
	alias : 'widget.documentstatistics',
	
	requires : [
		'Yamma.view.charts.ByStatePieChart'
	],
	
	title : 'Statistiques du courrier',
	width : 500,
	height : 300,
	layout : 'fit',
	headerPosition : 'right',
	renderTo : Ext.getBody(),
	
	config : {
		filters : []
	},
	
	items : [
		{
			xtype : 'bystatepiechart',
			border : false,
			preventHeader : true
		}		
	],
	
	initComponent : function() {
				
		this.callParent(arguments);		
		this.displayChart();
			
	},
	
	displayChart : function() {
		
		var matchingCharts = this.query('bystatepiechart');
		if (!matchingCharts || 0 == matchingCharts.length) return;
		
		var chart = matchingCharts[0];
		chart.load({
			filters : this.getFilters() || []
		});
	}

});