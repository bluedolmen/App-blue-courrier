Ext.define('Yamma.view.charts.byuser.ChartDefinition', {
	
	extend : 'Yamma.view.charts.ChartDefinition',
	
	mixins : {
		'groupbased' : 'Yamma.view.charts.GroupBasedMixin'
	},	

	title : i18n.t('view.charts.byuser.definition.title'),
	
	groupFieldName : 'userName',
	
	seriesConfig : {
		
	},
	
	getAggregatedDataStore : function() {
		
		if (null == this.dataStore) return null;
		
		var 
			data = [].concat(this.getAggregatedData(this.dataStore.getRange())),
			aggregatedFields = this.getAggregatedFields() // declared after to potentially use the previous computation to get the fields dynamically
		;
		
		return Ext.create('Ext.data.JsonStore', {
			
			fields : aggregatedFields,
			data : data
			
		});
		
	},
	
	getAggregatedFields : function() {
		
		return [this.groupFieldName].concat(this.aggregatedFields);
		
	},
	
	getAggregatedData : function(data /* as an Array of records */) {
		
		var
			me = this,
			userCache = {}
		;
		
		function getUserRecord(userName) {
			
			if (undefined === userCache[userName]) {
				userCache[userName] = {
					userName : userName
				};
				me.prepareUserRecord(userCache[userName]);
			}
			
			return userCache[userName];
			
		}
		
		Ext.Array.forEach(data, function(record) {
			
			var
				tasks = record.get('tasks')
			;
			
			Ext.Array.forEach(tasks, function(task) {
				
				var owners = task.owners;
				
				Ext.Array.forEach(owners, function(owner) {
					
					var userRecord = getUserRecord(owner);					
					me.updateUserRecord(userRecord, record, task);
					
				});
				
			});
						
			
		});
		
		return Ext.Array.map(Ext.Object.getKeys(userCache), function(userName) {
			
			var userRecord = userCache[userName];
			me.finalizeUserRecord(userRecord);
			
			return userRecord;
			
		});
		
	},
	
	prepareUserRecord : function(userRecord) {
		
	},
	
	updateUserRecord : function(userRecord, record, task) {
		
	},
	
	finalizeUserRecord : function(userRecord) {
		
	},
	
	getAxes : function() {
		
		return [
			this.getGroupValuesAxeDefinition(),
			this.getDocumentNumberAxeDefinition()
		];
		
	},	
	
	/**
	 * @protected
	 */
	getGroupValuesLabelTitle : function(value) {
		
		return value.split('|')[1] || value;
		
	},	
	
	getSeries : function() {
		
		var MAX_BAR_HEIGHT = 76;
		
		return [Ext.apply({
	        type: 'bar',
	        axis: 'top',
	        gutter: 80,
	        xField: this.groupFieldName,
	        yField: this.aggregatedFields,
	        title : this.aggregatedFieldTitles,
//	        stacked: true,
//	        tips: {
//	            trackMouse: true,
//	            width : 100,
//	            renderer: function(storeItem, item) {
//	                this.setTitle(String(item.value[1]) + ' courrier' + (item.value[1] > 1 ? 's' : ''));
//	            }
//	        },
	        renderer : function(sprite, record, attributes, index, store) {
	        	
	        	// Set the maximum height of a bar
				var mid_y = attributes.y + (attributes.height / 2);
				attributes.height = attributes.height > MAX_BAR_HEIGHT ? MAX_BAR_HEIGHT : attributes.height;
				attributes.y = mid_y - (attributes.height / 2);
				
	        	return attributes;
	        	
	        }
	    }, this.seriesConfig)];

	}	
	
	
});
