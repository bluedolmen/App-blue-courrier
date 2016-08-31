Ext.define('Yamma.view.charts.byservice.ByLateState', {
	
	extend : 'Yamma.view.charts.byservice.ByRecordValueChartDefinition',
	
	title : i18n.t('view.charts.byservice.latestate.title'),
	
	undeterminedValue : null, // discard since already taken into account
	aggregatedFields : ['onTime', 'hurry', 'late', 'undetermined'],
	aggregatedFieldTitles : [i18n.t('view.charts.byservice.latestate.field.ontime'), i18n.t('view.charts.byservice.latestate.field.hurry'), i18n.t('view.charts.byservice.latestate.field.late'), i18n.t('view.charts.byservice.latestate.field.undetermined')],

	recordFieldName : Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME
	
});

