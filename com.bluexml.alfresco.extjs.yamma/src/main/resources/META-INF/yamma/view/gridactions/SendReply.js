Ext.define('Yamma.view.gridactions.SendReply', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.windows.ConfirmDialog'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('email_go')
	},
	
	SEND_REPLY_ACTION_WS_URL : 'alfresco://bluexml/yamma/send-reply', 
	CONFIRM_MESSAGE : "Confirmez-vous l'envoi de la réponse à l'expéditeur ?</br>" +
						"Tout envoi devra être validé par une personne accréditée.",
	CONFIRM_TITLE : 'Envoyer la réponse ?',
	
	getSendReplyActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.SendReply.ICON.icon,
			tooltip : 'Envoyer la réponse',
			handler : this.onSendReplyAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchSendReplyAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchSendReplyAction : function(record) {
		var userCanReply = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_REPLY);
		var documentHasReplies = record.get(Yamma.utils.datasources.Documents.DOCUMENT_HAS_REPLIES_QNAME);
		
		return userCanReply && documentHasReplies;
	},
	
	onSendReplyAction : function(grid, rowIndex, colIndex, item, e) {
		
		var me = this;
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		
		askConfirmation();
		
		function askConfirmation () {
			
			Bluexml.windows.ConfirmDialog.FR.askConfirmation({
				title : me.CONFIRM_TITLE,
				msg : me.CONFIRM_MESSAGE,
				onConfirmation : Ext.bind(me.sendReply, me, [documentNodeRef])
			});
			
		};
		
		return false;
	},
	
	sendReply : function(documentNodeRef) {
		
		var me = this;
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
			this.SEND_REPLY_ACTION_WS_URL
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