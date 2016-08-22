Ext.define('Yamma.view.mails.itemactions.DownloadFileAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	text : i18n.t('view.mails.itemaction.downloadfile.text'), // 'Télécharger',
	
	iconCls : Yamma.Constants.getIconDefinition('page_white_get').iconCls,
	
	execute : function(record, item, view) {
		
		var
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			documentName = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NAME_QNAME)
		;
		Bluedolmen.view.utils.DownloadFrame.downloadDocument(nodeRef, documentName);
		
	}
	
});