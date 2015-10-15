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
	
	currentFilters : null,
	dirty : true,
	
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
		
	},
	
	nextView : function() {
		
		var nextChartView = this.getNextChartView();
		this.update(nextChartView);
		
	},
	
	update : function(chartView, filters) {
		
		if (undefined !== filters) {
			this.currentFilters = filters || null;
		}
		
		if (!this.isVisible(true /* deep */)) {
			this.dirty = true;
			return; // defer loading
		}
		
		if (!chartView) {
			chartView = this.getCurrentChartView();
		}
		
		if (null == this.currentFilters) {
			chartView.clear();
		}
		else {
			
			chartView.load(
				/* storeConfig */
				{
					filters : this.currentFilters 
				}
			);
			
		}
		
		this.dirty = false;
		
	},
	
	isDirty : function() {
		return this.dirty;
	},
	
	/**
	 * @private
	 * @returns
	 */
	getNextChartView : function() {
		
		var cardLayout = this.getLayout();
		if (!cardLayout) return null;
		
		return cardLayout.next(true, true);
		
	},	
	
	/**
	 * @private
	 * @returns
	 */
	getCurrentChartView : function() {
		
		return this.getLayout().getActiveItem();
		
	}
	
	
});