(function() {
	
	InboundMailUtils = {
			
		createMail : function(document) {

			specializeDocumentType();
			initializeDates();
			createDocumentContainer();

			function specializeDocumentType() {
				if (document.isSubType(YammaModel.INBOUND_MAIL_TYPE_SHORTNAME)) return;
				document.specializeType(YammaModel.INBOUND_MAIL_TYPE_SHORTNAME);
			}
			
			function createDocumentContainer() {
				
				var documentContainer = DocumentUtils.createDocumentContainer(document, true /* moveInside */);
				if (!documentContainer) {
					throw new Error("IllegalStateException! Cannot create the container for document '" + document.name + "'.");
				}
				
			}

			function initializeDates() {
				var NOW = new Date();
				
				Utils.forEach([
					YammaModel.MAIL_SENT_DATE_PROPNAME, 
					YammaModel.MAIL_WRITING_DATE_PROPNAME,
					YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME
				], function(propertyname) {
					if ( document.properties[YammaModel.MAIL_SENT_DATE_PROPNAME] == null) return; // already set => continue
					document.properties[YammaModel.MAIL_SENT_DATE_PROPNAME] = NOW;
				});
				
				document.save();
			}
			
		}
	
	}
	
})();