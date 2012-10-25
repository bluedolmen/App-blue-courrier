(function() {

	const
		USERNAME_AND_EMAIL_REGEXP = /^([^<]+)<(.*)>$/,
		ACKNOWLEDGMENT_TEMPLATE_NAME = "incoming-acknowledgment_fr.html.ftl"
	;
	
	ImapMailUtils = {
			
		mapImapMail : function(imapMail, yammaMail) {
			
			if (!imapMail.hasAspect('imap:imapContent')) return; // do nothing if not an imap-content 
			
			setOrigin();
			mapMailProperties();
			
			function setOrigin() {
				yammaMail.properties[YammaModel.INBOUND_DOCUMENT_ORIGIN_PROPNAME] = YammaModel.ORIGIN_IMAP;
				yammaMail.save();
			}
			
			function mapMailProperties() {
				
				mapFromTo({
					'cm:title' : 'cm:title',
					'imap:messageSubject' : YammaModel.MAIL_OBJECT_PROPNAME,
					'imap:messageId' : YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
					'imap:dateReceived' : YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME,
					'imap:dateSent' : [YammaModel.MAIL_SENT_DATE_PROPNAME, YammaModel.MAIL_WRITING_DATE_PROPNAME]
				});
				
				mapMessageFrom();
				mapMessageTo();
				mapMessageCc();
				
				
				mapContent();
				mapAttachments();
				
			}
	
			function mapFromTo(mapPropertiesTable) {
				
				var yammaProperties;
				
				for (var imapProperty in mapPropertiesTable) {
					
					yammaProperties = mapPropertiesTable[imapProperty];
					if (!Utils.isArray(yammaProperties)) {
						yammaProperties = [yammaProperties];
					}
					
					Utils.forEach(yammaProperties, function(yammaProperty) {
						yammaMail.properties[yammaProperty] = imapMail.properties[imapProperty];
					}); 
					
				}
				
				yammaMail.save();
			}
			
			function mapMessageFrom() {
				
				var 
					messageFrom = imapMail.properties['imap:messageFrom'],
					emailMatch = ImapMailUtils.extractMailInformation(messageFrom)
				;
				if (!emailMatch) return;
				
				yammaMail.properties[YammaModel.CORRESPONDENT_NAME_PROPNAME] = emailMatch.name;
				yammaMail.properties[YammaModel.CORRESPONDENT_CONTACT_EMAIL_PROPNAME] = emailMatch.email;
				
				yammaMail.save();
			}
			
			function mapMessageTo() {
				
				var 
					messageTo = imapMail.properties['imap:messageTo'],
					emailMatch = ImapMailUtils.extractMailInformation(messageTo)
				;
				if (!emailMatch) return;
				
				var matchingPersons = search.luceneSearch(
					'+TYPE:"cm\:person"' +
					' +@cm\\:email:"' + emailMatch.email + '"'
				);
				if (!matchingPersons || matchingPersons.length < 1) return;
				
				yammaMail.createAssociation(matchingPersons[0], YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME);
				
				yammaMail.properties[YammaModel.RECIPIENT_NAME_PROPNAME] = emailMatch.name;
				yammaMail.properties[YammaModel.RECIPIENT_CONTACT_EMAIL_PROPNAME] = emailMatch.email;
				
				yammaMail.save();
			}
			
			function mapMessageCc() {
				
			}
			
			function mapContent() {
				if (yammaMail == imapMail) return;
				yammaMail.properties.content.write(imapMail.properties.content);
			}
			
			function mapAttachments() {
				var 
					attachments = imapMail.assocs['imap:attachment'],
					attachmentsContainer,
					imapAttachmentsFolder
				;
				
				if (!Utils.isArray(attachments) || attachments.length == 0) return;
				
				attachmentsContainer = AttachmentUtils.getAttachmentsContainer(yammaMail, true /* createIfNotExists */);
				if (!attachmentsContainer) {
					logger.warn("Cannot get the attachments container of the document '" + yammaMail.name + "'");
					return;
				}
				
				Utils.forEach(attachments, function(attachment) {
					
					var moveSuccess = attachment.move(attachmentsContainer);
					
					if (!moveSuccess) {
						logger.warn("Cannot move IMAP attachment '" + attachment.displayPath + "'");
						return; // continue
					}
	
					imapMail.removeAssociation(attachment, 'imap:attachment');
					AttachmentUtils.addAttachment(yammaMail, attachment);
					
				});
				
				attachments = imapMail.assocs['imap:attachment']; // Retrieves the left attachments
				if (attachments && attachments.length >= 0) return;		
				
				// No more attachments, remove the attachments container
				imapAttachmentsFolder = (imapMail.assocs['imap:attachmentsFolder'] || [])[0];
				if (!imapAttachmentsFolder) return;
				
				imapMail.removeAssociation(imapAttachmentsFolder, 'imap:attachmentsFolder');
				imapAttachmentsFolder.remove();
				
			}			
			
		},

		extractMailInformation : function(value) {
			var
				trimmedValue = Utils.String.trim(value),
				emailMatch,
				name,
				email
			;
			if (!value) return null;
			
			if (Utils.String.isEmail(value)) {
				name = trimmedValue;
			} else {
				emailMatch = USERNAME_AND_EMAIL_REGEXP.exec(value);
				if (!emailMatch) return null;
				
				name = Utils.String.trim(emailMatch[1]) || '';
				email = Utils.String.trim(emailMatch[2]) || '';
				
				if (!Utils.String.isEmail(email)) email = '';
				
			}
			
			return {
				name : name,
				email : email || name
			};
		},
		
		
		sendAcknowledgment : function(mailDocument) {
						
			var recipientEmail = getSenderEmail();
			if (!recipientEmail) {
				logger.warn("Document '" + mailDocument.name + "': " + 'cannot send an acknowledgment to the sender, since the email value cannot be found.');
				return;
			}

			var templateDefinition = new TemplateDefinition.SendAcknowledgment(mailDocument);
			
			SendMailUtils.sendMail({
				
				document : mailDocument,
				recipientEmail : recipientEmail,
				templateDefinition : templateDefinition,
				
				sendMailSuccess : sendMailSuccess,
				sendMailFailure : sendMailFailure
			
			});
						
			function sendMailSuccess() {
				
			}
			
			function sendMailFailure(exception) {
				
			}

			function getSenderEmail() {
				
				if (mailDocument.hasAspect('imap:imapContent')) {
					
					var messageFrom = mailDocument.properties['imap:messageFrom'];
					if (messageFrom) return messageFrom;
					
				}
				
				if (mailDocument.hasAspec('cm:emailed')) {
					
					var originator = mailDocument.properties['cm:originator'];
					if (originator) return originator;
				}
				
				return null;
			}
			
		}
		
	
	};
	
	
	
	TemplateDefinition.SendAcknowledgment = function(document) {
		TemplateDefinition.Default.call(this, document, ACKNOWLEDGMENT_TEMPLATE_NAME /* templateName */);
		return this;
	};
	TemplateDefinition.SendAcknowledgment.prototype = new TemplateDefinition.Default();
	
	Utils.apply(TemplateDefinition.SendAcknowledgment.prototype, {
	
		constructor : TemplateDefinition.SendAcknowledgment,
		
		getTemplateArgs : function() {
			
			var 
				templateArgs = new Array()
			;
	
			templateArgs['object'] = this._getObject();
			templateArgs['sentDate'] = this._getSentDate();
			templateArgs['senderName'] = this._getSenderName();
			templateArgs['recipientName'] = this._getRecipientName();
			
			return templateArgs;
			
		},
		
		getMailSubject : function() {

			var subject = this._getSubject();
			if (subject) return ('Re: ' + subject);  
			else return NO_SUBJECT;
			
		},
		
		_getSubject : function() {
			
			if (this.document.hasAspect('imap:imapContent')) {
				return this.document.properties['imap:messageSubject'];
			}
			
			if (this.document.hasAspect('cm:emailed')) {
				return this.document.properties['cm:subjectline'];
			}
			
			return this.document.properties['cm:title'];
			
		},
		
		_getObject : function() {
			
			return this._getSubject();
			
		},
		
		_getSentDate : function() {
			
			if (this.document.hasAspect('imap:imapContent')) {
				return this.document.properties['imap:dateSent'];
			}
			
			if (this.document.hasAspect('cm:emailed')) {
				return this.document.properties['cm:sentdate'];
			}
			
			return new Date();
		},
		
		_getSenderName : function() {
			
			var 
				email = '',
				name = ''
			;
			
			if (this.document.hasAspect('imap:imapContent')) {
				email = this.document.properties['imap:messageFrom'];
			}
			
			if (this.document.hasAspect('cm:emailed')) {
				email = this.document.properties['cm:originator'];
			}
			
			var mailExtract = ImapMailUtils.extractMailInformation(email);
			if (!mailExtract) return '';
			
			return mailExtract.name || '';
		},
		
		_getRecipientName : function() {
			
			var 
				email = '',
				name = ''
			;
			
			if (this.document.hasAspect('imap:imapContent')) {
				email = this.document.properties['imap:messageTo'];
			}
			
			if (this.document.hasAspect('cm:emailed')) {
				email = this.document.properties['cm:addressee'];
			}
			
			var mailExtract = ImapMailUtils.extractMailInformation(email);
			if (!mailExtract) return '';
			
			return mailExtract.name || '';
		}
	});
	
})();