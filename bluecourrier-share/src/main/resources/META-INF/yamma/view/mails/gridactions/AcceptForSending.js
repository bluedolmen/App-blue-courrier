Ext.define('Yamma.view.mails.gridactions.AcceptForSending', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	tooltip : 'Accepter pour envoi postal',
	actionUrl : 'alfresco://bluedolmen/yamma/forward-for-sending',
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
	
	getAdditionalRequestParameters : function() {
		if (!this.usurpedManager) return null;
		
		return ({
			manager : this.usurpedManager
		});
	}	
	
});