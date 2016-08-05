Ext.define('Yamma.view.charts.byservice.ByRecordValueChartDefinition', {
	
	extend : 'Yamma.view.charts.byservice.ChartDefinition',
	
	recordFieldName : null,
	
	/**
	 * Value used when the record value is not defined.
	 * Set it to *null* to discard undefined values
	 */
	undeterminedValue : 'undetermined',	
	undeterminedValueTitle : 'Indéterminé',
	
	constructor : function() {
		
		if (!this.recordFieldName) {
			Ext.Error.raise('The recordFieldName has to be provided');
		}
		
		if (null != this.undeterminedValue && !Ext.Array.contains(this.aggregatedFields, this.undeterminedValue) ) {
			this.aggregatedFields.push(this.undeterminedValue);
			this.aggregatedFieldTitles.push(this.undeterminedValueTitle);
		}
		
		this.callParent();
		
	},
	
	computeAggregatedFields : function() {
		
		var len = (this.aggregatedFields || []).length;
		if (null != this.undeterminedValue) len--;
		if (len > 0) return; // already defined
		
		this.aggregatedFields = this.dataStore.collect(this.recordFieldName).concat(this.aggregatedFields || []);
		
		this.callParent();
		
	},
	
	computeAggregatedFieldTitles : function() {
		
		var me = this;
		
		this.aggregatedFieldTitles = Ext.Array.map(this.aggregatedFields, function(fieldName) {
			
			if (me.undeterminedValue == fieldName) return me.undeterminedValueTitle;
			return fieldName;
			
		});
		
		this.callParent();
		
	},
	
	getAggregatedData : function(data /* as an Array of records */) {
		
		var
			me = this,
			result = {
				total : Ext.isArray(data) ? data.length : 0 
			}
		;
		
		Ext.Array.forEach(data, function(record) {
			
			var value = record.get(me.recordFieldName) || me.undeterminedValue;
			if (!value) return;
			
			if (undefined === result[value]) {
				result[value] = 0;
			}
			
			result[value] += 1;
			
		});
		
		return result;
		
	}

});
