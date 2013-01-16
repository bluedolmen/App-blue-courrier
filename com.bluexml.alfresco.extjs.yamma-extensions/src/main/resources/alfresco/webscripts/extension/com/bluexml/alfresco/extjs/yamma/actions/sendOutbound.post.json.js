///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/send-utils.js">

(function() {
	
	Yamma.Actions.SendOutboundAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'send-outbound',
		sendByMail : false, /* boolean */ // whether the reply will be sent by mail on the sending step
		skipValidation : false,
		
		wsArguments : [
			{ name : 'sendByMail', defaultValue : 'true' }, 
			{ name : 'skipValidation', defaultValue : 'false' } 		
		],
		
		prepare : function() {
			this.sendByMail = ( Utils.asString(this.parseArgs['sendByMail']) === 'true' );
			this.skipValidation = ( Utils.asString(this.parseArgs['skipValidation']) === 'true' );
			this.eventType = this.eventType + '!' + (this.skipValidation ? 'sendOut' : 'sendToValidation');
		},		
		
		isExecutable : function(node) {
			
			return ( 
				ActionUtils.canSendOutbound(node, this.fullyAuthenticatedUserName) ||
				!this.skipValidation ||
				ActionUtils.canSkipValidation(node, this.fullyAuthenticatedUserName)
			);
			
		},
		
		doExecute : function(node) {
			
			this.fixWritingDate();
			this.manageSendByMail();
			
			if (this.skipValidation === true) {
				SendUtils.sendDocument(this.node);
			} else {
				this.updateDocumentState(YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED);
			}
			
			this.addHistoryComment();
			
		},
		
		fixWritingDate : function() {
			
			// Also update writing-date if not yet filled
			var writingDate = this.node.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
			if (null == writingDate) {
				this.node.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
			}
			this.node.save();
			
		},
		
		/**
		 * If the replies are meant to be sent by mail, then add the corresponding
		 * aspect to the contained replies
		 */
		manageSendByMail : function() {
			
			if (this.sendByMail !== true) return;
			
			var replies = ReplyUtils.getReplies(this.node);
			Utils.forEach(replies, function(reply) {
				reply.addAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME);
			});
			
		},
		
		addHistoryComment : function() {
			
			var 
				replies = ReplyUtils.getReplies(this.node),
				replyNames = Utils.map(replies, function(replyNode) {
					return replyNode.properties.title || replyNode.name;
				}),			
				formattedRepliesTitle = Utils.String.join(replyNames, ','),
				
				assignedAuthority = DocumentUtils.getAssignedAuthority(this.node),
				isAssignedAuthority = DocumentUtils.isAssignedAuthority(this.node, this.fullyAuthenticatedUserName)				
			;
			
			this.updateDocumentHistory(
				replies.length > 1 ? 'sendOutboundMails.comment' : 'sendOutboundMail.comment', 
				[
					formattedRepliesTitle,
					this.skipValidation ? 'envoi' : 'validation'
				],
				assignedAuthority, /* referrer */
				isAssignedAuthority ? null : this.fullyAuthenticatedUserName /* delegate */
			);
			
		}
		
	});

	Yamma.Actions.SendOutboundAction.execute();
	
})();