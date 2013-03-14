(function() {
	
	const 
		NO_SUBJECT = '(Pas de sujet)',
		REPLY_ABOUT_TO_SEND_TEMPLATE = "reply-about-to-send.html_fr.ftl",
		GENERIC_FAILURE_MESSAGE = 'échec'
	;
	
	OutcomingMailUtils = {
			
		sendAcknowledgment : function(document, onSendMailSuccess, onSendMailFailure) {
			
			var outcomingMail = OutcomingMailUtils.getOutcomingMail(document);
			if (null == outcomingMail) return;
			
			var recipientEmail = OutcomingMailUtils.getRecipientEmail(outcomingMail);
			if (null == recipientEmail) return;

			var templateDefinition = new TemplateDefinition.SendReplyAcknowledgment(outcomingMail);
			
			return SendMailUtils.sendMail({
				
				document : outcomingMail,
				recipientEmail : recipientEmail,
				templateDefinition : templateDefinition,
				
				sendMailSuccess : onSendMailSuccess || undefined,
				sendMailFailure : onSendMailFailure || undefined,
				silent : true
			
			});						
			
		},
		
		/**
		 * This method is used to send the reply itself by mail
		 */
		sendMail : function(document) {

			var outcomingMail = OutcomingMailUtils.getOutcomingMail(document);
			if (!OutcomingMailUtils.isSentByMail(outcomingMail)) throw {message : 'This document is not meant to be sent by email'};
			
			var recipientEmail = OutcomingMailUtils.getRecipientEmail(outcomingMail);
			if (!recipientEmail) throw { message :'The recipient is not defined'};

			var templateDefinition = OutcomingMailUtils.getTemplateDefinition(outcomingMail);
			if (!templateDefinition) throw { message : 'The template cannot be found for the given type ' + outcomingMail.typeShort };
			
			SendMailUtils.sendMail({
				
				document : outcomingMail,
				recipientEmail : recipientEmail,
				templateDefinition : templateDefinition,
				
				sendMailSuccess : sendMailSuccess || undefined,
				sendMailFailure : sendMailFailure || undefined,
				silent : true
			
			});
						
			function sendMailSuccess() {
				// Should historize the success of the sending
				
				if (!outcomingMail.hasAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME)) return;
					
				outcomingMail.properties[YammaModel.SENT_BY_EMAIL_SENT_DATE_PROPNAME] = new Date();
				outcomingMail.save();
				
			}
			
			function sendMailFailure(exception) {
				
				if (!outcomingMail.hasAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME)) return;
					
				outcomingMail.properties[YammaModel.SENT_BY_EMAIL_LAST_FAILURE_DATE_PROPNAME] = new Date();
				outcomingMail.save();
				
			}
			
		},
		
		getOutcomingMail : function(document) {
			
			if (null == document) return null;
			if (document.isSubType(YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME)) return document;
			
			// Here we only return the first reply
			var replies = ReplyUtils.getReplies(document);
			return replies[0];
			
		},
		
		isSentByMail : function(document) {
			
			return (
				null != document &&
				document.isSubType(YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME) &&
				document.hasAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME)
			);
			
		},
		
		getRecipientEmail : function(document) {
			var recipientEmail = document.properties[YammaModel.RECIPIENT_CONTACT_EMAIL_PROPNAME];
			if (null == recipientEmail) return null;
			
			return Utils.asString(recipientEmail);
		},
		
		getTemplateDefinition : function(document) {
			
			if (null == document) {
				throw new Error('IllegalArgumentException! The provided document is not valid (null or undefined)');
			}
			
			if (document.hasAspect(YammaModel.REPLY_ASPECT_SHORTNAME)) {
				return new TemplateDefinition.SendReply(document);
			}
			
			return null;
		}
	
	};
	
	
	/*
	 * TEMPLATE DEFINITIONS
	 */
	
	TemplateDefinition.SendReplyAcknowledgment = function(reply) {
		TemplateDefinition.Default.call(this, reply, REPLY_ABOUT_TO_SEND_TEMPLATE);
		this.repliedDocument = ReplyUtils.getRepliedDocument(reply);
		return this;
	};
	TemplateDefinition.SendReplyAcknowledgment.prototype = new TemplateDefinition.Default();
	
	Utils.apply(TemplateDefinition.SendReplyAcknowledgment.prototype, {
		
		constructor : TemplateDefinition.SendReplyAcknowledgment,
		
		getMailSubject : function() {
				
			var documentObject = this.document.properties[YammaModel.MAIL_OBJECT_PROPNAME];
			if (null != documentObject) return documentObject;
			
			var 
				object = this.repliedDocument.properties[YammaModel.MAIL_OBJECT_PROPNAME] || ''
			;
			
			if (null != object) {
				var subject = 'Réponse à votre courrier (' + object + ')';
				return subject;
			}
			
			return NO_SUBJECT;
			
		},
		
		getTemplateArgs : function() {
			
			var 
				templateArgs = new Array(),
				object = this.repliedDocument.properties[YammaModel.MAIL_OBJECT_PROPNAME] || '',
				sentDate = this.repliedDocument.properties[YammaModel.MAIL_SENT_DATE_PROPNAME],
				senderName = this.document.properties[YammaModel.CORRESPONDENT_NAME_PROPNAME], 
				recipientName = this.document.properties[YammaModel.RECIPIENT_NAME_PROPNAME]
			;
	
			templateArgs['object'] = object;
			templateArgs['sentDate'] = sentDate;
			templateArgs['senderName'] = senderName;
			templateArgs['recipientName'] = recipientName;
			
			return templateArgs;
			
		}

	});
	
	
	TemplateDefinition.SendReply = function(document) {
		TemplateDefinition.Default.call(this, document, REPLY_ABOUT_TO_SEND_TEMPLATE);
		return this;
	};
	TemplateDefinition.SendReply.prototype = new TemplateDefinition.Default();
	
	Utils.apply(TemplateDefinition.SendReply.prototype, {
		
		constructor : TemplateDefinition.SendReply,
		
		getTemplateArgs : function() {
			var 
				templateArgs = new Array(),
				repliedDocument = ReplyUtils.getRepliedDocument(this.document),
				object = repliedDocument.properties[YammaModel.MAIL_OBJECT_PROPNAME] || '',
				sentDate = repliedDocument.properties[YammaModel.MAIL_SENT_DATE_PROPNAME],
				senderName = repliedDocument.properties[YammaModel.CORRESPONDENT_NAME_PROPNAME],
				recipientName = repliedDocument.properties[YammaModel.RECIPIENT_NAME_PROPNAME]
			;
	
			templateArgs['object'] = object;
			templateArgs['sentDate'] = sentDate;
			templateArgs['senderName'] = senderName;
			templateArgs['recipientName'] = recipientName;
			
			return templateArgs;
		},
		
		getMailSubject : function() {
				
			var documentObject = this.document.properties[YammaModel.MAIL_OBJECT_PROPNAME];
			if (null != documentObject) return documentObject;
			
			var 
				repliedDocument = ReplyUtils.getRepliedDocument(this.document),
				object = repliedDocument.properties[YammaModel.MAIL_OBJECT_PROPNAME] || ''
			;
			
			if (null != object) {
				return ('Re: ' + object);
			}
			
			return NO_SUBJECT;
		}
		
	});
	
		
})();