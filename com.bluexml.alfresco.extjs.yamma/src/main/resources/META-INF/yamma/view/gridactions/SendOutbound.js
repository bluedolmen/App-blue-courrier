Ext.define('Yamma.view.gridactions.SendOutbound', {
	
	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluexml.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	tooltip : 'Transmettre pour envoi postal',
	actionUrl : 'alfresco://bluexml/yamma/send-outbound',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SEND_OUTBOUND,
	supportBatchedNodes : true,	
	
	confirmTitle : "Envoyer sans validation ?",
	confirmMessage : "Le(s) document(s) va(vont) être envoyé(s) sans la validation d'une personne accréditée.</br>" +
		"Confirmez-vous l'envoi ?",
	
	isAvailable : function(record, context) {
		
		var
			userCanSkipValidation = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SKIP_VALIDATION)
		;
		
		return (
			userCanSkipValidation &&
			this.callParent(arguments)
		);
				
	},
	
	prepareBatchAction : function(records) {		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
	},	
	
	performServerRequest : function(nodeRefs) {
		
		this.jsonPost({
			nodeRef : nodeRefs,
			skipValidation : true
		});
		
	}	
	
});