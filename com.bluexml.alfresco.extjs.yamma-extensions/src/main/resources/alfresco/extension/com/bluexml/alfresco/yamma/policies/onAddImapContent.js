///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	var 
		EMAIL_ONLY_REGEXP = /^([A-Za-z_-]+@[A-Za-z\.-]+)/,
		EMAIL_REGEXP = /([^A-Za-z_-]+)<\s*([A-Za-z_-]+@[A-Za-z\.-]+).*/
	;
	
	if ('undefined' == typeof document) {
		logger.warn('[onAddImapContent] Cannot find any contextual document.');
		return;
	}
	
	if (!document.hasAspect('imap:imapContent')) {
		return;
	}
	
	var 
		imapMail = document,
		yammaMail = null
	;
	
	main();

	function main() {
		
		var
			mailName = imapMail.name,
			targetTray = getTargetTray()
		;

		if (!targetTray) { return; }
		
		yammaMail = targetTray.createNode(mailName, YammaModel.INBOUND_MAIL_TYPE_SHORTNAME);
		if (!yammaMail) {
			logger.error('[onAddImapContent] Cannot create a YaMma mail for Imap mail mapping');
			return;
		}
		mapMailProperties();
		
	}
	
	function getTargetService() {
		return 'diradmgen';
	}
	
	function getTargetTray() {
		var
			targetServiceName = getTargetService(),
			site,
			siteNode,
			targetTray
		;
		
		site = siteService.getSite(targetServiceName);
		if (!site) {
			logger.warn("[onAddImapContent] Cannot find target site '" + targetServiceName + "'");
			return;			
		}
		
		siteNode = site.getNode();
		if (!siteNode) { return; }
	
		targetTray = TraysUtils.getSiteTray(siteNode, TraysUtils.INBOX_TRAY_NAME);
		if (!targetTray) {
			logger.warn('[onAddImapContent] Cannot find target tray.');
			return;
		}
		
		return targetTray;
	}
	
	function mapMailProperties() {
		
		mapFromTo({
			'cm:title' : 'cm:title',
			'imap:messageSubject' : YammaModel.MAIL_OBJECT_PROPNAME,
			'imap:messageId' : YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
			'imap:dateReceived' : YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME,
			'imap:dateSent' : YammaModel.MAIL_SENT_DATE_PROPNAME
		});
		
		mapMessageFrom();
		mapMessageTo();
		mapMessageCc();
		
		
		mapContent();
		mapAttachments();
		
	}

	function mapFromTo(mapPropertiesTable) {
		
		var yammaProperty;
		
		for (var imapProperty in mapPropertiesTable) {
			
			yammaProperty = mapPropertiesTable[imapProperty];
			yammaMail.properties[yammaProperty] = imapMail.properties[imapProperty];
			
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
			name = emailMatch[1];
			email = emailMatch[2];
		}
		
		return {
			name : name,
			email : email
		};
	}
	
	
})();
