Ext.define('Yamma.view.charts.byservice.ByTask', {
	
	extend : 'Yamma.view.charts.byservice.ChartDefinition',
	
	mixins : {
		'bytask' : 'Yamma.view.charts.ByTaskMixin'
	},
	
	title : i18n.t('view.charts.byservice.bytask.title'),
	legendPosition : 'right',
	
	aggregatedFields : [],
	aggregatedFieldTitles : [],

	computeAggregatedFields : function() {
		
		var
			me = this,
			hits = {},
			uniqueValues = []
		;
		
		this.dataStore.each(function(record) {
			
			var taskNames = me.getTaskNames(record); 
			
			Ext.Array.forEach(taskNames, function(taskName) {
				
				if (undefined == hits[taskName]) {
					hits[taskName] = true;
					uniqueValues.push(taskName);
				}
				
			});
			
		});
		
		this.aggregatedFields = uniqueValues;
		
		this.callParent();
		
	},
	
	computeAggregatedFieldTitles : function() {
		
		var me = this;
		
		this.aggregatedFieldTitles = Ext.Array.map(this.aggregatedFields, function(fieldName) {
			
			return me.getTaskTitle(fieldName);
			
		});
		
		this.callParent();
		
	},
	
	getAggregatedData : function(data /* as an Array of records */) {
		return this.mixins.bytask.getAggregatedData(data);
	}
	
});

