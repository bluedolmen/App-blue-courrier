Ext.define('Yamma.view.charts.StatesStatsView', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.statesstatsview',
	requires : [
		'Yamma.view.charts.ByStatePieChart',
		'Yamma.view.charts.ByStateBarChart'		
	],
	
	layout : 'card',
	title : 'Statistiques états',
	iconCls : 'icon-chart_curve',
	
	items : [
	
		{
			xtype : 'bystatepiechart' 
		},
		{
			xtype : 'bystatebarchart'
		}
	
	],
	
	tools:[
		{
		    type : 'next',
		    tooltip : 'Vue suivante',
		    itemId : 'nextView'
		}
	],
	
	listeners : {
		collapse : function(panel, eOpts) { this.updateNextViewToolVisibility(); },
		expand : function(panel, eOpts) { this.updateNextViewToolVisibility(); }
	},
	
	updateNextViewToolVisibility : function() {
		var nextViewTool = this.query('#nextView')[0];
		if (nextViewTool) nextViewTool.setVisible('right' != this.collapsed);		
	}
	
	
});