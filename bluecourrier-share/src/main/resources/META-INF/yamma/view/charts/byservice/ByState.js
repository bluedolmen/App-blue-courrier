Ext.define('Yamma.view.charts.byservice.ByState', {
	
	extend : 'Yamma.view.charts.byservice.ByRecordValueChartDefinition',
	
	title : 'Etat par service',
	
	undeterminedValue : null, // discard since should never happen
	aggregatedFields : ['pending', 'delivering', 'validating!delivery', 'processing','sending','processed'],
	aggregatedFieldTitles : [],
	recordFieldName : Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME,
	
	constructor : function() {
		
		this.aggregatedFieldTitles = Ext.Array.map(this.aggregatedFields, function(fieldName) {
			return Yamma.Constants.DOCUMENT_STATE_DEFINITIONS[fieldName].shortTitle;
		});
		
		this.callParent();
	}
	
});