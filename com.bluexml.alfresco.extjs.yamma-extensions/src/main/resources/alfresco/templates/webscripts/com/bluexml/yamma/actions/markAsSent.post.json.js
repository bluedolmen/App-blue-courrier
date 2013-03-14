///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/outmail-utils.js">

(function() {
	
	Yamma.Actions.MarkAsSentAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'sent-outbound',
		
		isExecutable : function(node) {
			
			return ActionUtils.canMarkAsSent(node, this.fullyAuthenticatedUserName);
			
		},
				
		doExecute : function(node) {
			
			this.outboundDocumentNode = OutcomingMailUtils.getOutcomingMail(this.node) || this.node;
			
			this.updateDocumentState(YammaModel.DOCUMENT_STATE_PROCESSED);
			this.updateOutboundMailSentDate();
			
			//this.sendByMailIfNecessary(); // TODO: Reactivate when this feature will be necessary
			this.sendAcknowledgment();
			this.addHistoryComment();
			
		},
		
		updateOutboundMailSentDate : function() {
			this.outboundDocumentNode.properties[YammaModel.MAIL_SENT_DATE_PROPNAME] = new Date();
			this.outboundDocumentNode.save();
		},
		
		sendAcknowledgment : function() {
			
			var message = OutcomingMailUtils.sendAcknowledgment(this.node, onSendMailSuccess, onSendMailFailure);

			function onSendMailSuccess() {
				Actions.DocumentNodeAction.updateDocumentHistory.call(this, 
					'sentEmail.success.comment', /* msgKey */
					null, /* commentArgs */
					'system' /* referrer */
				);
			}
			
			function onSendMailFailure(exception, errorMessage) {				
				Actions.DocumentNodeAction.updateDocumentHistory.call(this, 
					'sentEmail.failure.comment', /* msgKey */
					[errorMessage || ''], /* commentArgs */
					'system' /* referrer */
				);
			}

		},
		
		sendByMailIfNecessary : function() {
			
			if (!OutcomingMailUtils.isSentByMail(this.outboundDocumentNode)) return;
			var errorMessage = OutcomingMailUtils.sendMail(this.outboundDocumentNode);
			
			if (errorMessage) {
				// Failed sending the mail
				this.updateDocumentHistory('sentEmail.failure.comment', [errorMessage]);
			} else {
				this.updateDocumentHistory('sentEmail.success.comment');
			}
			
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