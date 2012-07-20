Ext.define('Yamma.view.gridactions.ValidateReply', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.windows.ConfirmDialog',
		'Bluexml.windows.CommentInputDialog'
	],
	
	statics : {
		ICON_OK : Yamma.Constants.getIconDefinition('email_go'),
		ICON_REFUSE : Yamma.Constants.getIconDefinition('email_delete')
	},
	
	VALIDATE_REPLY_ACTION_WS_URL : 'alfresco://bluexml/yamma/validate-reply',
	
	DIALOG_CONFIG : {
		
		'accept' : {
			CONFIRM_MESSAGE : "Validez-vous l'envoi de la réponse à l'expéditeur ?",
			CONFIRM_TITLE : 'Valider la réponse'	
		},
		
		'refuse' : {
			CONFIRM_MESSAGE : "Quelle est la raison de ce refus ?",
			CONFIRM_TITLE : 'Refuser la réponse'
		}
		
	},
	
	getAcceptReplyActionDefinition : function() {
		
		return this.getValidateReplyActionDefinition(
			'accept', /* validateOperation */
			Yamma.view.gridactions.ValidateReply.ICON_OK.icon, /* icon */
			'Valider l\'envoi de la réponse' /* tooltip */
		);
		
	},
	
	getRefuseReplyActionDefinition : function() {
		
		return this.getValidateReplyActionDefinition(
			'refuse', /* validateOperation */
			Yamma.view.gridactions.ValidateReply.ICON_REFUSE.icon, /* icon */
			'Refuser l\'envoi de la réponse', /* tooltip */
			true /* askForComment */
		);
		
	},
	
	getValidateReplyActionDefinition : function(validateOperation, icon, tooltip, askForComment) {
		
		var me = this;
		
		return	{
			icon : icon,
			tooltip : tooltip,
			handler : this.onValidateReplyAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchValidateReplyAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			},
			validateOperation : validateOperation,
			askForComment : !!askForComment
		};
		
	},
	
	canLaunchValidateReplyAction : function(record) {
		var userCanValidate = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE);
		return userCanValidate;
	},
	
	onValidateReplyAction : function(grid, rowIndex, colIndex, item, e) {
		
		var me = this;
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		var validateOperation = item.validateOperation;
		var askForComment = !!item.askForComment;
		
		if (!validateOperation) {
			Ext.Error.raise('IllegalStateException! Cannot get the reply-validation action');
		}
		var dialogConfig = me.DIALOG_CONFIG[validateOperation];
		
		if (askForComment) askComment();
		else askConfirmation();
		
		function askComment() {
			
			Bluexml.windows.CommentInputDialog.askForComment(
				{
					title : dialogConfig.CONFIRM_TITLE,
					msg : dialogConfig.CONFIRM_MESSAGE,
					modal : true
				}, /* overrideConfig */
				onCommentAvailable
			);
			
			function onCommentAvailable(comment) {
				me.validateReply.call(me, documentNodeRef, validateOperation, comment);
			}
			
		}
		
		function askConfirmation () {
			
			Bluexml.windows.ConfirmDialog.FR.askConfirmation({
				title : dialogConfig.CONFIRM_TITLE,
				msg : dialogConfig.CONFIRM_MESSAGE,
				onConfirmation : Ext.bind(me.validateReply, me, [documentNodeRef, validateOperation])
			});
			
		};
		
		return false;
	},
	
	validateReply : function(documentNodeRef, operation, comment) {
		
		var me = this;
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
			this.VALIDATE_REPLY_ACTION_WS_URL
		);		

		Bluexml.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : documentNodeRef,
					operation : operation,
					comment : comment || ''
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