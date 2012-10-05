(function() {

	const
		EMAIL_ONLY_REGEXP = /^([A-Za-z_-]+@[A-Za-z\.-]+)\s*/,
		EMAIL_REGEXP = /\s*([^<]+)\s*<\s*([A-Za-z_-]+@[A-Za-z\.-]+)\s*>.*/
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
					emailMatch = extractMailInformation(messageFrom)
				;
				if (!emailMatch) return;
				
				yammaMail.properties[YammaModel.CORRESPONDENT_NAME_PROPNAME] = emailMatch.name;
				yammaMail.properties[YammaModel.CORRESPONDENT_CONTACT_EMAIL_PROPNAME] = emailMatch.email;
				
				yammaMail.save();
			}
			
			function mapMessageTo() {
				
				var 
					messageTo = imapMail.properties['imap:messageTo'],
					emailMatch = extractMailInformation(messageTo)
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
			
			function extractMailInformation(value) {
				var 
					emailMatch,
					name,
					email
				;
				if (!value) return null;
				
				emailMatch = EMAIL_ONLY_REGEXP.exec(value);
				if (emailMatch) {
					name = email = emailMatch[0];
				} else {
					emailMatch = EMAIL_REGEXP.exec(value);
					if (!emailMatch) return null;
					name = emailMatch[1] || '';
					email = emailMatch[2] || '';
				}
				
				return {
					name : Utils.String.trim(name),
					email : email
				};
			}
			
		}
		
	
	};
	
})();