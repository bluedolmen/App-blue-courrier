Ext.define('Yamma.view.gridactions.RefuseReply', {

	extend : 'Yamma.view.gridactions.GridAction',
	
	uses : [
		'Bluexml.windows.CommentInputDialog'
	],
	
	statics : {
		CONFIRM_MESSAGE : "Quelle est la raison de ce refus ?",
		CONFIRM_TITLE : 'Refuser la réponse'
	},
		
	icon : Yamma.Constants.getIconDefinition('cross').icon,
	tooltip : 'Refuser la réponse',
	actionUrl : 'alfresco://bluexml/yamma/refuse-reply',
	
	isAvailable : function(record) {
		
		var
			canValidate = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE),
			canMarkAsSigned = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SIGNED)
		;
		
		return (canValidate || canMarkAsSigned);
	},
		
	performAction : function(record) {		
		
		var
			me = this,
			nodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		function askComment() {
			
			Bluexml.windows.CommentInputDialog.askForComment(
				{
					title : Yamma.view.gridactions.RefuseReply.CONFIRM_TITLE,
					msg : Yamma.view.gridactions.RefuseReply.CONFIRM_MESSAGE,
					modal : true
				}, /* overrideConfig */
				onCommentAvailable
			);
				

			function onCommentAvailable(comment) {
				
				me.jsonPost({
					nodeRef : nodeRef,
					operation : 'refuse',
					comment : comment
				});
				
			}
			
		}
		
		askComment();
	
	}
	
});