Ext.define('Yamma.view.charts.byuser.ByTask', {
	
	extend : 'Yamma.view.charts.byuser.ChartDefinition',

	title : i18n.t('view.charts.byuser.bytask.title'),
	
	manager : true,
	
	legendPosition : 'right',
	
	seriesConfig : {
		stacked : true
	},
	
	aggregatedFields : [],
	aggregatedFieldTitles : [],
	
	taskNameHits : {},
	
	getAggregatedFields : function() {
		
		this.aggregatedFields = Ext.Object.getKeys(this.taskNameHits);
		
		this.aggregatedFieldTitles = Ext.Array.map(this.aggregatedFields, function(taskName) {
			return (Yamma.Constants.WORKFLOW_TASK_DEFINITIONS[taskName] || Yamma.Constants.WORKFLOW_TASK_DEFINITIONS['default']).title; 
		});
		
		return this.callParent();
		
	},
	
	prepareUserRecord : function(userRecord) {
		Ext.apply(userRecord, {
			tasks : {}
		});		
	},
	
	updateUserRecord : function(userRecord, record, task) {
		
		var taskName = task.name;
		
		if (undefined == this.taskNameHits[taskName]) {
			this.taskNameHits[taskName] = true;
		}
		
		if (undefined === userRecord[taskName]) {
			userRecord[taskName] = 0;
		}
		userRecord[taskName] += 1;
		
	},
	
	finalizeUserRecord : function(userRecord) {
	}	
		
});
