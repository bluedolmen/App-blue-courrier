Ext.define('Yamma.controller.charts.StatesStatsViewController', {

	extend : 'Ext.app.Controller',
	
	refs : [
	
	    {
	    	ref : 'statesStatsView',
	    	selector : 'statesstatsview'
	    }
	    
	],
	
	init: function() {
		
		this.control({
			'documentstatistics': {
				show : this.onShow
			},
			
			'statesstatsview #nextView': {
				click : this.onNextView
			},
			
			'documentstatistics #nextView': {
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
		
		var 
			currentFilters = context ? context.getDocumentDatasourceFilters() : null,
			statesStatsView = this.getStatesStatsView()
		;
		if (null == statesStatsView) return;
			
		statesStatsView.update(null, currentFilters);
		
	},
	
	onNextView : function() {
		var statesStatsView = this.getStatesStatsView();
		statesStatsView.nextView();		
	},
	
	onShow : function() {
		var statesStatsView = this.getStatesStatsView();
		if (statesStatsView.isDirty()) {
			statesStatsView.update();
		}	
	}
	
});