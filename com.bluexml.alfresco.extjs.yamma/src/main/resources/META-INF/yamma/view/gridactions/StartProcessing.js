Ext.define('Yamma.view.gridactions.StartProcessing', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	statics : {
		START_PROCESSING_ACTION_ICON : Yamma.Constants.getIconDefinition('pencil_go')
	},
	
	START_PROCESSING_ACTION_WS_URL : 'alfresco://bluexml/yamma/take-processing',
	
	getStartProcessingActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.StartProcessing.START_PROCESSING_ACTION_ICON.icon,
			tooltip : 'Traiter le document',
			handler : this.onStartProcessingAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchStartProcessingAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchStartProcessingAction : function(record) {
		var userCanProcessDocument = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_PROCESS_DOCUMENT);
		return !!userCanProcessDocument;
	},
	
	onStartProcessingAction : function(grid, rowIndex, colIndex, item, e) {
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		this.startProcessingDocument(documentNodeRef);
		
		return false;
	},
	
	startProcessingDocument : function(documentNodeRef) {
		
		var me = this;
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
			this.START_PROCESSING_ACTION_WS_URL
		);
		
		Bluexml.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : documentNodeRef
				}
			},
			
			function(jsonResponse) { /* onSuccess */
				me.refresh(); 
			}
		);	
		
	},	
	
	getDocumentNodeRefRecordValue : function(record) {
		throw new Error('Should be redefined by the inclusive class');
	}	
	
});