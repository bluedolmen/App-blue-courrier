Ext.define('Yamma.view.gridactions.MarkAsSent', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.windows.ConfirmDialog'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('stamp'),
		LABEL : 'Marquer comme envoyé',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SENT,
		ACTION_WS_URL : 'alfresco://bluexml/yamma/mark-as-sent' 
	},
	
	
	getMarkAsSentActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.MarkAsSent.ICON.icon,
			tooltip : Yamma.view.gridactions.MarkAsSent.LABEL,
			handler : this.onMarkAsSentAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canMarkAsSentAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canMarkAsSentAction : function(record) {
		var userCanMarkAsSent = record.get(Yamma.view.gridactions.MarkAsSent.FIELD);
		return userCanMarkAsSent;
	},
	
	onMarkAsSentAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		this.markAsSent(documentNodeRef);
	},
	
	markAsSent : function(documentNodeRef) {
		
		var 
			me = this,
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				Yamma.view.gridactions.MarkAsSent.ACTION_WS_URL
			)
		;		

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