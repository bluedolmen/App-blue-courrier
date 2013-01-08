Ext.define('Yamma.view.gridactions.ForwardReply', {

	extend : 'Yamma.view.gridactions.GridAction',
	
	uses : [
		'Yamma.view.dialogs.ForwardDialog'
	],
		
	icon : Yamma.Constants.getIconDefinition('arrow_double_right').icon,
	tooltip : 'Transmettre',
	actionUrl : 'alfresco://bluexml/yamma/forward-reply',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,	
		
	performAction : function(record) {		
		
		var
			me = this,
			nodeRef = record.get('nodeRef'),
			enclosingService = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			enclosingServiceName = enclosingService.name,
			canSkipValidation = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SKIP_VALIDATION),
			hasSignableReplies = record.get(Yamma.utils.datasources.Documents.MAIL_HAS_SIGNABLE_REPLIES_QNAME)
		;
		
		me.forwardDialog = Ext.create('Yamma.view.dialogs.ForwardDialog', {
			
			initialService : enclosingServiceName,
			canSkipValidation : canSkipValidation,
			hasSignableReplies : hasSignableReplies,
			
			forward : function() {
				
				var
					service = this.getService(),
					approbe = this.getApprobeStatus(),
					operation = this.getOperation(),
					managerUserName = this.getManagerUserName(),
					wsOperation = null
				;
				
				if (approbe) {					
					if (Yamma.view.dialogs.ForwardDialog.Operation.SEND == operation) {
						wsOperation = 'acceptAndSend';
					} else if (Yamma.view.dialogs.ForwardDialog.Operation.SIGN == operation) {
						wsOperation = 'acceptForSignature';
					} else if (Yamma.view.dialogs.ForwardDialog.Operation.FORWARD == operation) {
						wsOperation = 'acceptAndForward';
					}
				} else if (Yamma.view.dialogs.ForwardDialog.Operation.FORWARD == operation) {
					wsOperation = 'forward';
				}
				
				if (!wsOperation) {
					Ext.Error.raise('IllegalStateException! The operation cannot be determined with the current dialog configuration.');
				}
				
				me.forwardDialog.hide();
				
				me.jsonPost(
					{
						nodeRef : nodeRef,
						operation : wsOperation,
						service : service,
						manager : managerUserName
					}
				);
				
			}
			
		});
		
		this.forwardDialog.show();
		
	},
	
	onSuccess : function() {
		this.callParent();
		if (null != this.forwardDialog) {
			this.forwardDialog.close();
			this.forwardDialog = null;
		}
	}
	
});