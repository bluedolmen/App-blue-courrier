(function() {
	
	IncomingMailUtils = {
			
		createMail : function(document, typeShort) {

			typeShort = typeShort || YammaModel.INBOUND_MAIL_TYPE_SHORTNAME; // default is Inbound Mail
			
			specializeDocumentType();
			createDocumentContainer();
			initializeDates();
			setInitialState();

			function specializeDocumentType() {
				if (document.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME)) return; // Already specialized in a YaMma document object
				document.specializeType(typeShort);
			}
			
			function createDocumentContainer() {
				
				var documentContainer = DocumentUtils.createDocumentContainer(document, true /* moveInside */);
				if (!documentContainer) {
					throw new Error("IllegalStateException! Cannot create the container for document '" + document.name + "'.");
				}
				
			}

			function initializeDates() {
				var NOW = new Date();
				
				if (document.hasAspect(YammaModel.MAIL_ASPECT_SHORTNAME)) {
					setPropertyIfEmpty(YammaModel.MAIL_SENT_DATE_PROPNAME, NOW);
					setPropertyIfEmpty(YammaModel.MAIL_WRITING_DATE_PROPNAME, NOW);					
				}
				
				if (document.isSubType(YammaModel.INBOUND_MAIL_TYPE_SHORTNAME)) {
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
			
			function setPropertyIfEmpty(propertyName, value) {
				if ( document.properties[propertyName] != null) return; // already set => continue
				document.properties[propertyName] = value;				
			}
			
		}
	
	};
	
})();