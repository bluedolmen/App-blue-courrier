///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	
	Yamma.Actions.RetrieveReplyNodesAction = Utils.Object.create(Yamma.Actions.NodeAction, {

		doExecute : function(node) {
			
			var replies = ReplyUtils.getReplies(node);
			if (Utils.isArrayEmpty(replies)) return;
			
			var repliesDescriptions = Utils.map(replies, function(replyNode) {
				
				return ({
					nodeRef : Utils.asString(replyNode.nodeRef),
					attachments : Utils.map(AttachmentUtils.getAttachments(replyNode), function(attachmentNode) {
						return Utils.asString(attachmentNode.nodeRef);
					})
				});
				
			});
			
			return ({
				replies : repliesDescriptions
			}); // outcome
			
		}		
		
	});

	Yamma.Actions.RetrieveReplyNodesAction.execute();
	
})();