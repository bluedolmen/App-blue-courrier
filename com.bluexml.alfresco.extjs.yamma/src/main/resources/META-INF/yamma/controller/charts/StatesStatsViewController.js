Ext.define('Yamma.controller.charts.StatesStatsViewController', {

	extend : 'Ext.app.Controller',
	
	refs : [
	
	    {
	    	ref : 'statesStatsView',
	    	selector : 'statesstatsview'
	    }
	    
	],
	
	currentFilters : [],
	
	init: function() {
		
		this.control({
			'statesstatsview #nextView': {
				click : this.onNextView
			}
		});
		
		this.application.on({
			contextChanged : this.onContextChanged,
			scope : this
		});
		
		this.callParent(arguments);
	},
	
	onContextChanged : function(context) {
		
		this.currentFilters = context.getDocumentDatasourceFilters();
		this.loadViewWithCurrentFilters();
		
	},
	
	loadViewWithCurrentFilters : function(chartView) {
		
		if (!chartView) {
			chartView = this.getCurrentChartView();
		}
		
		var currentFilters = this.currentFilters || [];
		
		chartView.load(
			/* storeConfig */
			{
				filters : currentFilters 
			}
		);
		
	},
	
	onNextView : function() {
		var nextChartView = this.getNextChartView();
		if (!nextChartView) return;
		
		this.loadViewWithCurrentFilters(nextChartView);
	},
	
	getNextChartView : function() {
		var statesStatsView = this.getStatesStatsView();
		if (!statesStatsView) return null;
		
		var cardLayout = statesStatsView.getLayout();
		if (!cardLayout) return null;
		
		return cardLayout.next(true, true);		
	},
	
	getCurrentChartView : function() {
		var statesStatsView = this.getStatesStatsView();
		if (!statesStatsView) return null;
		
		return statesStatsView.getLayout().getActiveItem();
	}
	
});