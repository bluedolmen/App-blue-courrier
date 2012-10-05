(function() {
	
	const 
		NO_SUBJECT = '(Pas de sujet)',
		OUTCOMING_MAIL_PATH = 'app:dictionary/app:email_templates/cm:yamma',
		REPLY_ABOUT_TO_SEND_TEMPLATE = "reply-about-to-send.html_fr.ftl",
		GENERIC_FAILURE_MESSAGE = 'échec'
	;
	
	
	OutcomingMailUtils = {
			
		sendMail : function(document) {

			outcomingMail = OutcomingMailUtils.getOutcomingMail(document);
			if (!OutcomingMailUtils.isSentByMail(outcomingMail)) throw {message : 'This document is not meant to be sent by email'};
			
			try {
				sendMailInternal();
				manageSuccessfulSentMail();
				return '';
			} catch (e) {
				return manageSentMailFailure();
			}
			
			function sendMailInternal() {
				
				var recipientEmail = OutcomingMailUtils.getRecipientEmail(outcomingMail);
				if (!recipientEmail) throw { message :'The recipient is not defined'};

				var templateDefinition = OutcomingMailUtils.getTemplateDefinition(outcomingMail);
				if (!templateDefinition) throw { message : 'The template cannot be found for the given type ' + outcomingMail.typeShort };
				
				var
					mail = actions.create("mail"),
					template = templateDefinition.getTemplate(),
					templateArgs = templateDefinition.getTemplateArgs(),
					subject = templateDefinition.getMailSubject(),
					templateModel = new Array()
				;
				
				templateModel['args'] = templateArgs;
				
				mail.parameters.to = recipientEmail;
				mail.parameters.subject = subject;
				mail.parameters.template = template;
				mail.parameters.template_model = templateModel;

				mail.execute(outcomingMail);				
			}
			
			function manageSuccessfulSentMail() {
				// Should historize the success of the sending
				
				if (outcomingMail.hasAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME)) {
					outcomingMail.properties[YammaModel.SENT_BY_EMAIL_SENT_DATE_PROPNAME] = new Date();
					outcomingMail.save();
				}
			}
			
			function manageSentMailFailure(exception) {
				
				if (outcomingMail.hasAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME)) {
					outcomingMail.properties[YammaModel.SENT_BY_EMAIL_LAST_FAILURE_DATE_PROPNAME] = new Date();
					outcomingMail.save();
				}
				
				if ('string' == typeof exception) return (exception || GENERIC_FAILURE_MESSAGE);
				if ('string' == typeof exception.message) return (exception.message || GENERIC_FAILURE_MESSAGE);
				return GENERIC_FAILURE_MESSAGE;

			}
			
		},
		
		getOutcomingMail : function(document) {
			
			if (!document) return null;
			if (document.isSubType(YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME)) return document;
			
			// Here we only return the first reply
			var replies = ReplyUtils.getReplies(document);
			return replies[0];
		},
		
		isSentByMail : function(document) {
			
			if (
				!document ||
				!document.isSubType(YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME) ||
				!document.hasAspect(YammaModel.SENT_BY_EMAIL_ASPECT_SHORTNAME)
			) {
				return false;
			};
			
			return true;			
		},
		
		getRecipientEmail : function(document) {
			var recipientEmail = document.properties[YammaModel.RECIPIENT_CONTACT_EMAIL_PROPNAME];
			return recipientEmail;
		},
		
		getTemplateDefinition : function(document) {
			
			var 
				typeShort = document.typeShort,
				localName = typeShort.split(':')[1] || ''
			;
			
			if (!localName) return null;
			var templateDefinitionClass = TemplateDefinition[localName];
			if (!templateDefinitionClass) return null;
			
			return new templateDefinitionClass(document);
		}
	
	};
	
	
	/*
	 * TEMPLATE DEFINITIONS
	 */
	
	
	var TemplateDefinition = {};
	
	TemplateDefinition.Reply = function(document) {
		this.document = document;
		return this;
	}
	
	TemplateDefinition.Reply.prototype.getTemplate = function() {
		
		var templateDir = companyhome.childrenByXPath(OUTCOMING_MAIL_PATH)[0];
		if (!templateDir) throw { message : "The mail templates directory '" + OUTCOMING_MAIL_PATH + "' cannot be found in the repository" };
		
		var template = templateDir.childByNamePath(REPLY_ABOUT_TO_SEND_TEMPLATE);
		if (!template) throw { message : "The mail template for replies '" + templatePath + "' cannot be found"  };
		
		return template;
	};
		
	TemplateDefinition.Reply.prototype.getTemplateArgs = function() {
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
	};
		
	TemplateDefinition.Reply.prototype.getMailSubject = function() {
			
		var documentObject = this.document.properties[YammaModel.MAIL_OBJECT_PROPNAME];
		if (documentObject) return documentObject;
		
		var 
			repliedDocument = ReplyUtils.getRepliedDocument(this.document),
			object = repliedDocument.properties[YammaModel.MAIL_OBJECT_PROPNAME] || ''
		;
		
		if (object) {
			return ('Re: ' + object);
		}
		
		return NO_SUBJECT;
	};		
		
	
})();