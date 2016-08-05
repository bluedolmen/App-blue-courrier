Ext.define('Yamma.view.charts.byservice.ByLateState', {
	
	extend : 'Yamma.view.charts.byservice.ByRecordValueChartDefinition',
	
	title : 'Retard par service',
	
	undeterminedValue : null, // discard since already taken into account
	aggregatedFields : ['onTime', 'hurry', 'late', 'undetermined'],
	aggregatedFieldTitles : ['OK', 'Urgent', 'En retard', 'Indéterminé'],

	recordFieldName : Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME
	
});

