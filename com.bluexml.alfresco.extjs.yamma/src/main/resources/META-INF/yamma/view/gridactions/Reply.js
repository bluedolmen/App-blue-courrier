Ext.define('Yamma.view.gridactions.Reply', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Yamma.view.windows.UploadFormWindow'	
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('email_add'),
		LABEL : 'Répondre au courrier',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_REPLY,
		ACTION_WS_URL : 'alfresco://bluexml/yamma/reply-mail'
	},
	
	getReplyActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.Reply.ICON.icon,
			tooltip : Yamma.view.gridactions.Reply.LABEL,
			handler : this.onReplyAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchReplyAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchReplyAction : function(record) {
		var userCanReply = record.get(Yamma.view.gridactions.Reply.FIELD);
		return !!userCanReply;
	},
	
	onReplyAction : function(grid, rowIndex, colIndex, item, e) {
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		this.replyDocument(documentNodeRef);
		
		return false;
	},
	
	replyDocument : function(documentNodeRef) {
		
		var uploadUrl = Bluexml.Alfresco.resolveAlfrescoProtocol(
			Yamma.view.gridactions.Reply.ACTION_WS_URL
		);
		
		chooseFile();

		function chooseFile() {
	
			Ext.create('Yamma.view.windows.UploadFormWindow', {
				title : 'Choisissez un fichier en <b>réponse</b>',
				formConfig : {
					uploadUrl : uploadUrl + '?format=html', // force html response format due to ExtJS form submission restriction 
					additionalFields : [{
						name : 'nodeRef',
						value : documentNodeRef
					}]
				}
			}).show();
			
		};
		
	},	
	
	getDocumentNodeRefRecordValue : function(record) {
		throw new Error('Should be redefined by the inclusive class');
	}	
	
});