///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/send-utils.js">


(function() {
	
	Yamma.Actions.MarkAsSignedAction = Utils.Object.create(Yamma.Actions.ManagerDocumentNodeAction, {
		
		eventType : 'signed-outbound',		
		
		isExecutable : function(node) {
			
			return ActionUtils.canMarkAsSigned(node, this.fullyAuthenticatedUserName);
			
		},
		
		doExecute : function(node) {
			
			this.updateOutboundMailSignedDate();
			SendUtils.sendDocument(this.node);		
			this.addHistoryComment();		
			
		},
		
		updateOutboundMailSignedDate : function() {
			
			var 
				replies = ReplyUtils.getReplies(this.node),
				firstReplyNode = replies[0] 
			;
			
			if (null == firstReplyNode) {
				throw {
					code : '500',
					message : 'IllegalStateException! Cannot find any reply for the provided document. This should not happen at this stage.'
				}
			}

			firstReplyNode.properties[YammaModel.SIGNABLE_SIGNED_DATE_PROPNAME] = new Date();
			firstReplyNode.save();
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
				replies.length > 1 ? 'signedOutboundMails.comment' : 'signedOutboundMail.comment', 
				[formattedRepliesTitle]
			);
			
		}
		
	});

	Yamma.Actions.MarkAsSignedAction.execute();
	
})();