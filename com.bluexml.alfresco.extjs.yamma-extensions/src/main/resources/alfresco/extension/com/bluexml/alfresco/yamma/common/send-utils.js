(function() {
	
	/**
	 * This utilities may be used in various places for actions since several
	 * transitions may be subject to sending a document.
	 * This utility is however not included in the yamma-environment since
	 * this is a very specific need...
	 */
	SendUtils = {
		
		sendDocument : function(documentNode, sendByMail) {
			
			updateDocumentState();
			moveDocumentToOutbox();
			
			function updateDocumentState() {
				
				documentNode.properties[YammaModel.STATUSABLE_STATE_PROPNAME] = YammaModel.DOCUMENT_STATE_SENDING;				
				documentNode.save();
				
			}
						
			function moveDocumentToOutbox() {
				// Moves the document to the outbox tray of the service
				var message = DocumentUtils.moveToSiblingTray(documentNode, TraysUtils.OUTBOX_TRAY_NAME);
				if (message) {
					throw {
						code : '512',
						message : 'IllegalStateException! ' + message
					};			
				}				
			}
						
		}			
	
	}
	
})();