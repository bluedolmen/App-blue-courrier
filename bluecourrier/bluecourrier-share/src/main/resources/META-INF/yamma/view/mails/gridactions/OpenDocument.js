// TODO: Refactor this action if used later

Ext.define('Yamma.view.mails.gridactions.DownloadDocument', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	statics : {
		DOWNLOAD_DOCUMENT_ACTION_ICON : Yamma.Constants.getIconDefinition('page_white_get')
	},
	
	DOWNLOAD_DOCUMENT_WS_URL : 'alfresco://api/node/content/',
	
	getDownloadDocumentActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.mails.gridactions.DownloadDocument.DOWNLOAD_DOCUMENT_ACTION_ICON.icon,
			tooltip : 'Télécharger le document',
			handler : this.onDownloadAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canDownloadAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canDownloadAction : function(record) {
		var userCanProcessDocument = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_PROCESS_DOCUMENT);
		return !!userCanProcessDocument;
	},
	
	onDownloadAction : function(grid, rowIndex, colIndex, item, e) {
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		this.startProcessingDocument(documentNodeRef);
		
		return false;
	},
	
	downloadDocument : function(nodeRef) {
		var nodeRef = this.nodeRef;
		if (!nodeRef) return;
		
		var name = this['cm:name'];
		var resolvedUrl = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
			Yamma.view.mails.gridactions.DownloadDocument.DOWNLOAD_DOCUMENT_WS_URL + nodeRef.replace(/:\//,'') + (name ? '/' + name : '') + '?a=true'
		);
		
		Bluedolmen.view.utils.DownloadFrame.download(resolvedUrl);
	}	
	
});