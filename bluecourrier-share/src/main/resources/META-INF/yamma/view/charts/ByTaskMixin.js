/**
 * Meant to be used as a mixin!
 */
Ext.define('Yamma.view.charts.ByTaskMixin', {
	
	title : i18n.t('view.charts.bytaskmixin.title'),
	
	getTaskTitle : function(value) {
		
		return ( Yamma.Constants.WORKFLOW_TASK_DEFINITIONS[value] || Yamma.Constants.WORKFLOW_TASK_DEFINITIONS['default'] ).title;
		
	},
	
	getTaskNames : function(record) {
		
		var
			tasks = record.get('mytasks') || []
		;
		
		return Ext.Array.map(tasks, function(taskDef) {
			return taskDef.name;
		});
		
	},
	
	getAggregatedData : function(data /* as an Array of records */) {
		
		var
			me = this,
			result = {
				total : Ext.isArray(data) ? data.length : 0 
			}
		;
		
		Ext.Array.forEach(data, function(record) {
			
			var taskNames = me.getTaskNames(record);

			Ext.Array.forEach(taskNames, function(taskName) {
				
				if (undefined === result[taskName]) {
					result[taskName] = 0;
				}
				
				result[taskName] += 1;
				
			});
			
			
		});
		
		return result;
		
	}	
	
	
});

