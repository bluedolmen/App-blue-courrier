///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/outmail-utils.js">

(function() {

	/**
	 * This action is obsoleted, use the generic task action instead
	 * @deprecated
	 */
	
	Yamma.Actions.MarkAsSentAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'sent-outbound',
		
		isExecutable : function(node) {
			
			return ActionUtils.canMarkAsSent(node, this.fullyAuthenticatedUserName);
			
		},
				
		doExecute : function(node) {
			
			
		},
		
		
		addHistoryComment : function() {
			
			var 
				replies = ReplyUtils.getReplies(this.node),
				replyNames = Utils.map(replies, function(replyNode) {
					return replyNode.properties.title || replyNode.name;
				}),			
				formattedRepliesTitle = Utils.String.join(replyNames, ',')
			;
			
			this.updateDocumentHistory(
				replies.length > 1 ? 'sentOutboundMails.comment' : 'sentOutboundMail.comment', 
				[formattedRepliesTitle]
			);
		}
		
	});

	Yamma.Actions.MarkAsSentAction.execute();	
	
})();