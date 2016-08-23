Ext.define('Yamma.view.mails.gridactions.ForwardToSignature', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('text_signature_go').icon,
	tooltip : i18n.t('view.mails.gridactions.forwardtosignature.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/forward-for-signing',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,	
		
	supportBatchedNodes : true,
	managerAction : true,
	
	isAvailable : function(record, context) {
		
		var
			enclosingService = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			isSigningService = enclosingService.isSigningService, // TODO: OBSOLETE 
			hasSignableReplies = record.get(Yamma.utils.datasources.Documents.MAIL_HAS_SIGNABLE_REPLIES_QNAME)
		;
		
		return (
			isSigningService &&
			hasSignableReplies &&
			this.callParent(arguments)
		);
				
	},	
	
	getAdditionalRequestParameters : function() {
		
		if (!this.usurpedManager) return null;
		
		return ({
			manager : this.usurpedManager || undefined
		});
	}	
	
	
});