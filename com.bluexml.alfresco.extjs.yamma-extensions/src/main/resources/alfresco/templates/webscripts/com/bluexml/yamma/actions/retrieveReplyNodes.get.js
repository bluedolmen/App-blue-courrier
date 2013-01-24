///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">

(function() {
	
	
	Yamma.Actions.RetrieveReplyNodesAction = Utils.Object.create(Yamma.Actions.NodeAction, {

		doExecute : function(node) {
			
			var replies = ReplyUtils.getReplies(node);
			if (Utils.isArrayEmpty(replies)) return;
			
			var repliesRefs = Utils.map(replies, function(replyNode) {
				return Utils.asString(replyNode.nodeRef);
			});
			
			return ({
				replies : repliesRefs
			}); // outcome
			
		}		
		
	});

	Yamma.Actions.RetrieveReplyNodesAction.execute();
	
})();