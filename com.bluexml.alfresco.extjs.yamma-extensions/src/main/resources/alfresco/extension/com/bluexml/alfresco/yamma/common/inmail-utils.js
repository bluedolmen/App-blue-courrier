///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/imap-mail-utils.js">

(function() {
	
	const DEFAULT_OWNER_UID = 'admin';
	
	IncomingMailUtils = {
					
		createMail : function(document, typeShort) {

			typeShort = typeShort || YammaModel.INBOUND_MAIL_TYPE_SHORTNAME; // default is Inbound Mail
			var documentContainer = null;
			
			specializeDocumentType();
			createDocumentContainer();
			changeDocumentOwnership(); // Change after creating the document-container else the rights of deleting the document (by moving) are lost
			
			if (document.hasAspect('imap:imapContent')) {
				processImapMail();
			}
			
			initializeDates();
			setInitialState();
			setOrigin();

			function specializeDocumentType() {
				if (document.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)) return; // Already specialized in a YaMma document object
				document.specializeType(typeShort);
			}
			
			function createDocumentContainer() {
				
				documentContainer = DocumentUtils.createDocumentContainer(document, true /* moveInside */);
				if (!documentContainer) {
					throw new Error("IllegalStateException! Cannot create the container for document '" + document.name + "'.");
				}
				
			}
			
			function changeDocumentOwnership() {
				document.setOwner(DEFAULT_OWNER_UID);
				documentContainer.setOwner(DEFAULT_OWNER_UID);
			}
			
			function processImapMail() {
				ImapMailUtils.mapImapMail(document, document); // the target mail is also the document
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
			
		}
	
	};
	
})();