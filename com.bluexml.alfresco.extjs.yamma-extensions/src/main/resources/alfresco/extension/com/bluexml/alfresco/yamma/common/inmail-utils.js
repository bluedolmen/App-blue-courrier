///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/imap-mail-utils.js">

(function() {
	
	const DEFAULT_OWNER_UID = 'admin';
	
	IncomingMailUtils = {
					
		createMail : function(document, typeShort) {

			// INIT
			
			typeShort = typeShort || YammaModel.INBOUND_MAIL_TYPE_SHORTNAME; // default is Inbound Mail
			var documentContainer = null;
			
			
			// MAIN			
			
			specializeDocumentType();
			createDocumentContainer();
			changeDocumentOwnership(); // Change after creating the document-container else the rights of deleting the document (by moving) are lost
			
			if (document.hasAspect('imap:imapContent')) {
				processImapMail();
			}
			
			initializeDates();
			setInitialReference();
			setInitialState();
			setOrigin();


			// FUNCTIONS
			
			function specializeDocumentType() {
				if (document.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)) return; // Already specialized in a YaMma document object
				document.specializeType(typeShort);
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
			
			function processImapMail() {
				ImapMailUtils.mapImapMail(document, document); // the target mail is also the document
				ImapMailUtils.sendAcknowledgment(document, onSendMailSuccess, onSendMailFailure);
				
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

			function initializeDates() {
				var NOW = new Date();
				
				if (document.isSubType(YammaModel.MAIL_TYPE_SHORTNAME)) {
					setPropertyIfEmpty(YammaModel.MAIL_SENT_DATE_PROPNAME, NOW);
					setPropertyIfEmpty(YammaModel.MAIL_WRITING_DATE_PROPNAME, NOW);					
				}
				
				if (document.hasAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME)) {
					setPropertyIfEmpty(YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME, NOW);
				}
				
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
			
			function setInitialState() {

				var 
					typeShort = Utils.asString(document.typeShort), // get the real document typeShort 
					state = YammaModel.DOCUMENT_STATE_PENDING // default
				;

				if (YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME == typeShort) {
					var 
						creator = document.properties['creator'],
						person = people.getPerson(creator)
					;
					
					if (person) {
						document.addAspect(YammaModel.ASSIGNABLE_ASPECT_SHORTNAME);
						document.createAssociation(person, YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME);
					}
					
					state = YammaModel.DOCUMENT_STATE_PROCESSING;
					
					// TODO: Check whether a locking is necessary here
				}
				
				setPropertyIfEmpty(YammaModel.STATUSABLE_STATE_PROPNAME, state);
				document.save();
				
			}
			
			function setOrigin() {
				
				var origin = document.properties[YammaModel.INBOUND_DOCUMENT_ORIGIN_PROPNAME];
				if (!origin) {
					document.properties[YammaModel.INBOUND_DOCUMENT_ORIGIN_PROPNAME] = YammaModel.ORIGIN_DIGITIZED;
					document.save();
				}
				
			}
			
			function setPropertyIfEmpty(propertyName, value) {
				if ( document.properties[propertyName] != null) return; // already set => continue
				document.properties[propertyName] = value;				
			}
			
		},
		
		/**
		 * @return {Boolean} false if the document was managed correctly
		 */
		manageReplyDocument : function(document) {
			
			if (null == document) return false;
			
			var 
				documentName = document.name,
				enclosingSiteName = document.getSiteShortName(),
				reference = referenceProvider.getExistingReference(document)
			;
			
			if (!ReplyUtils.isReplyReference(reference)) return false;
				
			var existingReplyNode = referenceProvider.getNode(reference);
			if ( null == existingReplyNode || !ReplyUtils.isReplyNode(existingReplyNode) ) {
				var message = "A new reply-document '" + documentName + "'"
					+ " has entered service '" + enclosingSiteName + "'"
					+ " but has no existing reply. As such it is ignored.";
				logger.warn(message);
				return false;
			}
			
			var repliedDocumentNode = ReplyUtils.getRepliedDocument(existingReplyNode);
			if (!DocumentUtils.checkDocumentState(repliedDocumentNode, YammaModel.DOCUMENT_STATE_SIGNING) ) {
				var message = "A new reply-document '" + documentName + "'"
					+ " has entered service '" + enclosingSiteName + "'"
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