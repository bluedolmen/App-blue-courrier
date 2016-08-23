Ext.define('Yamma.view.charts.byservice.ByPrivacy', {
	
	extend : 'Yamma.view.charts.byservice.ByRecordValueChartDefinition',
	
	title : i18n.t('view.charts.byservice.byprivacy.title'),
	
	aggregatedFields : [], // Important! to get them computed on the right prototype object
	aggregatedFieldTitles : [],
	
	recordFieldName : Yamma.utils.datasources.Documents.PRIVACY_QNAME
	
});

