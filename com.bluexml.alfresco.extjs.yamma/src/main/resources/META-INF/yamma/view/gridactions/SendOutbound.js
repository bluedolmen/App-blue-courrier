Ext.define('Yamma.view.gridactions.SendOutbound', {
	
	extend : 'Yamma.view.gridactions.GridAction',
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	tooltip : 'Envoyer',
	actionUrl : 'alfresco://bluexml/yamma/send-outbound',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SEND_OUTBOUND,	

	statics : {
		CONFIRM_MESSAGE : "Le document va dorénavant être envoyé.</br>" +
							"Désirez-vous valider l'envoi par une personne accréditée ?",
		CONFIRM_TITLE : 'Envoyer avec validation ?'
	},
	
	performAction : function(record) {		
		
		var
			me = this,
			documentNodeRef = this.getDocumentNodeRefRecordValue(record),
			userCanSkipValidation = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SKIP_VALIDATION)
		;
		
		function askConfirmation () {

			Ext.MessageBox.show({
				title : Yamma.view.gridactions.SendOutbound.CONFIRM_TITLE,
				msg : Yamma.view.gridactions.SendOutbound.CONFIRM_MESSAGE,
				buttonText : {
					'yes' : 'Oui',
					'no' : 'Non',
					'cancel' : 'Annuler'
				},
				buttons: this.YESNOCANCEL,
				icon : Ext.Msg.QUESTION,
				fn : onButtonClicked 			
			});

			function onButtonClicked(buttonId) {
				if ('cancel' == buttonId) return; // do nothing
				
				var skipValidation = 'no' === buttonId;
				sendOutbound(skipValidation);				
			}
			
		};
		
		function sendOutbound(skipValidation) {
			me.jsonPost({
				nodeRef : documentNodeRef,
				skipValidation : skipValidation
			});
		}
		
		if (userCanSkipValidation) {
			askConfirmation();
		} else {
			sendOutbound(false /* skipValidation */);
		}
	
	}
	
});