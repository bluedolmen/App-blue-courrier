///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/send-utils.js">


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
				lastReplyNode = ReplyUtils.getLastReply(this.node)
			;
			
			if (null == lastReplyNode) {
				throw {
					code : 500,
					message : 'IllegalStateException! Cannot find any reply for the provided document. This should not happen at this stage.'
				}
			}

			lastReplyNode.properties[YammaModel.SIGNABLE_SIGNED_DATE_PROPNAME] = new Date();
			lastReplyNode.save();
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