Ext.define('Yamma.view.mails.gridactions.RefuseReply', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
		
	mixins : {
		commentedAction : 'Bluedolmen.utils.alfresco.grid.CommentedAction'
	},
	
	commentTitle :  i18n.t('view.mails.gridactions.refusereply.commentTitle'),
	commentMessage :  i18n.t('view.mails.gridactions.refusereply.commentMessage'),
		
	icon : Yamma.Constants.getIconDefinition('cross').icon,
	tooltip : i18n.t('view.mails.gridactions.refusereply.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/refuse-reply',
	
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
	
	
	getAdditionalRequestParameters : function(comment) {
		
		return ({
			operation : 'refuse',
			comment : comment,
			manager : this.usurpedManager || undefined
		});
		
	}	
	
});