Ext.define('Yamma.view.gridactions.ForwardToSignature', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('text_signature_go').icon,
	tooltip : 'Transmettre pour signature',
	actionUrl : 'alfresco://bluexml/yamma/forward-for-signing',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,	
		
	supportBatchedNodes : true,
	managerAction : true,
	
	isAvailable : function(record, context) {
		
		var
			enclosingServce = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			isSigningService = enclosingServce.isSigningService, 
			hasSignableReplies = record.get(Yamma.utils.datasources.Documents.MAIL_HAS_SIGNABLE_REPLIES_QNAME)
		;
		
		return (
			isSigningService &&
			hasSignableReplies &&
			this.callParent(arguments)
		);
				
	},	
	
	performServerRequest : function(nodeRefs) {
		
		this.jsonPost({
			nodeRef : nodeRefs,
			manager : this.usurpedManager || undefined
		});
		
	}	
	
});