///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/imap-mail-utils.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/outmail-utils.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	const DEFAULT_OWNER_UID = 'admin';
	
	IncomingMailUtils = {
		
		createMail : function(document, typeShort) {

			// INIT
			
			var 
				documentContainer = null,
				NOW = new Date()
			;
			
			// MAIN			
			
			if (!document.hasAspect(YammaModel.MAIL_ASPECT_SHORTNAME)) {
				document.addAspect(YammaModel.MAIL_ASPECT_SHORTNAME);
			}
			
			addDefaultAspects();
			createDocumentContainer();
			// 2014-10-15: Remove the change of ownership => does not comply with outgoing documents management
//			initializeDates();
			moveExistingAttachments();

			if (document.hasAspect(YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME)) {
				processOutboundMail();
			} 
			else {
				changeDocumentOwnership(); // Change after creating the document-container else the rights of deleting the document (by moving) are lost
				processInboundMail();
			}
			
			// Set initial reference after setting aspect in case of reference depending on document-type
			setInitialReference();
			
			if (document.hasAspect('imap:imapContent')) {
				processImapMail();
			}
			

			
			
			
			////////////////////
			// HELPER FUNCTIONS
			////////////////////
			
			function setPropertyIfEmpty(propertyName, value, forceSave) {
				
				if ( document.properties[propertyName] != null) return; // already set => continue
				document.properties[propertyName] = value;
				
				if (true === forceSave) {
					document.save();
				}
				
			}
			
			function addDefaultAspects() {
				
				document.addAspect(YammaModel.DUEABLE_ASPECT_SHORTNAME);
				document.addAspect(YammaModel.PRIORITIZABLE_ASPECT_SHORTNAME);
				
			}
			
			function createDocumentContainer() {
				
				documentContainer = DocumentUtils.createDocumentContainer(document, true /* moveInside */);
				if (null == documentContainer) {
					throw new Error("IllegalStateException! Cannot create the container for document '" + document.name + "'.");
				}
				
			}
			
			function changeDocumentOwnership() {
				
				document.setOwner(DEFAULT_OWNER_UID);
				documentContainer.setOwner(DEFAULT_OWNER_UID);
				
			}
			
			function initializeDates() {

				if (!MailUtils.isMail(document)) return;
				
				setPropertyIfEmpty(YammaModel.MAIL_SENT_DATE_PROPNAME, NOW);
				setPropertyIfEmpty(YammaModel.MAIL_WRITING_DATE_PROPNAME, NOW);					
				document.save();
				
			}
			
			function setInitialReference() {
				
				// The reference is already set if a barcode is extracted from
				// the document (see the corresponding metadata extractor)
				
				var
					reference = referenceProvider.getExistingReference(document),
					mimetype = document.properties.content.mimetype
				;
				
				if (null == reference) {
					reference = referenceProvider.setReference(
						document, 
						false /* override */, 
						"yamma" /* providerId */, 
						null /* providerConfig */
					);
				}
				
				setPropertyIfEmpty(YammaModel.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME, reference);
				setPropertyIfEmpty(YammaModel.REFERENCEABLE_REFERENCE_PROPNAME, reference);
				document.save();
				
			}			
			
			function moveExistingAttachments() {
				
				var attachments = document.assocs['cm:attachments'] || [];
				
				Utils.forEach(attachments, function(attachment) {
					AttachmentUtils.addAttachment(document, attachment);
				});
				
			}
			
			function processInboundMail() {
				
				document.addAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME);

//				// Set delivery date
				setPropertyIfEmpty(YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME, NOW, true);
				
				// Set origin
				setPropertyIfEmpty(YammaModel.INBOUND_DOCUMENT_ORIGIN_PROPNAME, YammaModel.ORIGIN_DIGITIZED, true);
				
//				// Restrict permissions removing view from instructors
//				restrictPermission();

				// Start the incoming workflow
				Yamma.DeliveryUtils.startIncomingWorkflow(document);
				
			}
			
			function restrictPermission() {
				
				var 
					serviceName = Utils.Alfresco.getEnclosingSiteName(document),
					serviceAssistantGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME),
					serviceManagerGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME)
				;				
				
				documentContainer.setInheritsPermissions(false);
				documentContainer.setPermission('SiteCollaborator', 'GROUP_' + serviceAssistantGroupName);
				documentContainer.setPermission('SiteCollaborator', 'GROUP_' + serviceManagerGroupName);				
				
			}
			
			function processOutboundMail() {
				
				var 
					state = YammaModel.DOCUMENT_STATE_PROCESSING
				;
				
				setPropertyIfEmpty(YammaModel.MAIL_WRITING_DATE_PROPNAME, NOW);
				setPropertyIfEmpty(YammaModel.STATUSABLE_STATUS_PROPNAME, state);
				document.save();
				
				// Start the outgoing workflow
				OutgoingMailUtils.startOutgoingWorkflow(document);				
				
			}
			
			function processImapMail() {
				
				ImapMailUtils.mapImapMail(document, document); // the target mail is also the document
//				ImapMailUtils.sendAcknowledgment(document, onSendMailSuccess, onSendMailFailure);
				
				function onSendMailSuccess() {
					
					HistoryUtils.addHistoryEvent(
						document, 
						'email.sendAcknowledgment.success', /* eventType */ 
						'', /* message */
						'system' /* referrer */
					);
										
				}
				
				function onSendMailFailure(exception) {
					
					HistoryUtils.addHistoryEvent(
						document, 
						'email.sendAcknowledgment.failure', /* eventType */ 
						'string' == typeof exception ? exception : exception.message, /* message */
						'system' /* referrer */
					);
					
					return true; // silent
					
				}

			}

		},
		
		/**
		 * @return {Boolean} false if the document was managed correctly
		 */
		manageReplyDocument : function(document) {
			
			if (null == document) return false;
			
			var 
				documentName = document.name,
				reference = referenceProvider.getExistingReference(document)
			;
			
			if (!ReplyUtils.isReplyReference(reference)) return false;
				
			var existingReplyNode = referenceProvider.getNode(reference);
			if ( null == existingReplyNode || !ReplyUtils.isReplyNode(existingReplyNode) ) {
				var message = "A new reply-document '" + documentName + "'"
					+ " has entered service '" + Utils.Alfresco.getEnclosingSiteName(document) + "'"
					+ " but has no existing reply. As such it is ignored.";
				logger.warn(message);
				return false;
			}
			
			var repliedDocumentNode = ReplyUtils.getRepliedDocument(existingReplyNode);
			if (!DocumentUtils.checkDocumentState(repliedDocumentNode, YammaModel.DOCUMENT_STATE_SIGNING) ) {
				var message = "A new reply-document '" + documentName + "'"
					+ " has entered service '" + Utils.Alfresco.getEnclosingSiteName(document) + "'"
					+ " but the related replied document is not in signing-state. As such it is ignored.";
				logger.warn(message);
				return false;
			}
			
			main();
			
			return true;
			
			
			
			function main() {
				updateReplyContent();
				// Remove the node which is unnecessary by now
				document.remove();
			}
			
			function updateReplyContent() {
				
				var
					newReplyContent = document.properties.content,
					replyFileName = document.name
				;
				
				UploadUtils.updateContent(existingReplyNode, newReplyContent, {
					filename : replyFileName,
					versionLabel : 'beforeSigning' // create a version
				});
				
			}
			
		}
	
	};
	
})();