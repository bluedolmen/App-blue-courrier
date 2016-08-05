Ext.define('Yamma.view.charts.GroupBasedChartDefinition', {

	extend : 'Yamma.view.charts.ChartDefinition',
	
	mixins : {
		'groupbased' : 'Yamma.view.charts.GroupBasedMixin'
	},
	
	groupFieldName : '', // Should be set

	checkDataStore : function() {
		
		var
			me = this,
			reasonToFail = this.callParent(),
			fieldNames
		;
		if (reasonToFail) return reasonToFail;
		
		fieldNames = Ext.Array.map(me.dataStore.model.getFields(), function(fieldDef) {
			return fieldDef.name;
		});
		
		// Check whether there is a service field
		if (!Ext.Array.contains(fieldNames, me.groupFieldName)) {
			return "There is no field named '" + me.groupFieldName + "' (required for grouping)";
		}
		
	},
	
	prepareDataStore : function() {
		
		this.dataStore.group(this.groupFieldName, 'DESC');
		
	},
	
	getAggregatedDataStore : function() {
		
		var 
			me = this,
			data
		;
		
		if (null == this.dataStore) return null;
		
		data = Ext.Array.map(this.dataStore.getGroups(), function(group) {
			
			var
				name = group.name,
				children = group.children,
				countData = me.getAggregatedData(children)
			;
			
			countData[me.groupFieldName] = name;
			
			return countData;
			
		});
		
		return Ext.create('Ext.data.JsonStore', {
			
			fields : [me.groupFieldName].concat(me.aggregatedFields),
			data : data
			
		});
		
	},
		
	getAxes : function() {
		
		return [
			this.getGroupValuesAxeDefinition(),
			this.getDocumentNumberAxeDefinition()
		];
		
	}	
	
});
