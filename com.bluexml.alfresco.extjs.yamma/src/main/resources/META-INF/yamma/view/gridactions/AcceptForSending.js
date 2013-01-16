Ext.define('Yamma.view.gridactions.AcceptForSending', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	tooltip : 'Accepter pour envoi postal',
	actionUrl : 'alfresco://bluexml/yamma/forward-for-sending',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,	
		
	supportBatchedNodes : true,
	managerAction : true,
	
	isAvailable : function(record, context) {
		
		var
			hasSignableReplies = record.get(Yamma.utils.datasources.Documents.MAIL_HAS_SIGNABLE_REPLIES_QNAME)
		;
		
		return (
			!hasSignableReplies &&
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