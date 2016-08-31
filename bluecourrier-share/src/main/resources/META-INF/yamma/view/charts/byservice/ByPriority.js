Ext.define('Yamma.view.charts.byservice.ByPriority', {
	
	extend : 'Yamma.view.charts.byservice.ByRecordValueChartDefinition',
	
	title : i18n.t('view.charts.byservice.bypriority.title'),
	
	aggregatedFields : [], // Important! to get them computed on the right prototype object
	aggregatedFieldTitles : [],

	
	recordFieldName : Yamma.utils.datasources.Documents.PRIORITY_QNAME,
	
	computeAggregatedFieldTitles : function() {
		
		var me = this;
	
		// Discard the values on titles and camelize the string
		
		this.aggregatedFieldTitles = Ext.Array.map(this.aggregatedFields, function(fieldName) {
			
			if (me.undeterminedValue == fieldName) return me.undeterminedValueTitle;
			return Ext.String.capitalize( (fieldName.split('|')[0] || '').toLowerCase());
			
		});
		
	}	
	
});

