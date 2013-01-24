Ext.define('Yamma.view.gridactions.RefuseReply', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
		
	mixins : {
		commentedAction : 'Bluexml.utils.alfresco.grid.CommentedAction'
	},
	
	commentTitle : 'Refuser la réponse',
	commentMessage : "Quelle est la raison de ce refus ?",
		
	icon : Yamma.Constants.getIconDefinition('cross').icon,
	tooltip : 'Refuser la réponse',
	actionUrl : 'alfresco://bluexml/yamma/refuse-reply',
	
	supportBatchedNodes : true,
	managerAction : true,
	
	isAvailable : function(record) {
		
		var
			canValidate = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE),
			canMarkAsSigned = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SIGNED)
		;
		
		return (canValidate || canMarkAsSigned);
	},
	
	prepareBatchAction : function(records) {
		
		this.mixins.commentedAction.askForComment.call(this, records);
		
	},
	
	
	getAdditionalRequestParameters : function() {
		
		return ({
			operation : 'refuse',
			comment : comment,
			manager : this.usurpedManager || undefined
		});
		
	}	
	
});