Ext.define('Yamma.view.charts.byuser.ByDocumentNumber', {
	
	extend : 'Yamma.view.charts.byuser.ChartDefinition',

	title : i18n.t('view.charts.byuser.bydocumentnumber.title'),//'Documents par utilisateur',
	
	manager : true,
	
	aggregatedFields : ['documentsCount', 'lateDocumentsCount'],
	aggregatedFieldTitles : [ i18n.t('view.charts.byuser.bydocumentnumber.fields.documentsCount'), i18n.t('view.charts.byuser.bydocumentnumber.fields.lateDocumentsCount')],
	
	prepareUserRecord : function(userRecord) {
		
		Ext.apply(userRecord, {
			documents : {},
			lateDocuments : {}
		});
		
	},
	
	updateUserRecord : function(userRecord, record, task) {

		// Ok! This is sub-optimal in getting the same value multiple times
		var 
			nodeRef = record.get('nodeRef'),
			lateState = record.get(Yamma.utils.datasources.Documents.DOCUMENT_LATE_STATE_QNAME)
		;
		
		userRecord.documents[nodeRef] = true;
		
		if (Yamma.utils.datasources.Documents.LATE_STATE_LATE_VALUE == lateState) {
			userRecord.lateDocuments[nodeRef] = true;
		}
		
	},
	
	finalizeUserRecord : function(userRecord) {
		
		userRecord.documentsCount = Ext.Object.getSize(userRecord.documents);
		userRecord.lateDocumentsCount = Ext.Object.getSize(userRecord.lateDocuments);
		
		delete userRecord.documents;
		delete userRecord.lateDocuments;
		
	}	
		
});
