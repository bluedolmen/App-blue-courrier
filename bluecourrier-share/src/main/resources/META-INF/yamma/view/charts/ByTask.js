Ext.define('Yamma.view.charts.ByTask', {
	
	extend : 'Yamma.view.charts.ChartDefinition',
	
	mixins : {
		'bytask' : 'Yamma.view.charts.ByTaskMixin'
	},
	
	title : i18n.t('view.charts.bytask.title'),//'Tâches',
	legendPosition : null,	
	
	aggregatedFields : ['taskName', 'count'],
	
	getAggregatedData : function(data /* as an Array of records */) {
		
		var
			me = this,
			result = this.mixins.bytask.getAggregatedData(data)
		;
		
		return Ext.Array.clean(
			Ext.Array.map(Ext.Object.getKeys(result), function(taskName) {
			
				if ('total' == taskName) return;
				return {
					'taskName' : me.getTaskTitle(taskName), 
					'count' : result[taskName]
				};
				
			})
		);
		
	},	
	
	getSeries : function() {
		
		return [{
            type : 'pie',
            field : 'count',
            showInLegend : true,
            donut : false,
            tips: {
                trackMouse: true,
                width : 250,
                renderer: function(storeItem, item) {
                    this.setTitle(storeItem.get('taskName') + ' : ' + storeItem.get('count')  + ' courrier' + (storeItem.get('count') > 1 ? 's' : ''));
                }
            },
            highlight: {
                segment: {
                    margin: 20
                }
            },
            label: {
                field: 'taskName',
                display: 'rotate',
                contrast: true,
                font: '18px Arial'
            }
        }];
		
	}
	
});

