(function() {
	
	/**
	 * This utilities may be used in various places for actions since several
	 * transitions may be subject to sending a document.
	 * This utility is however not included in the yamma-environment since
	 * this is a very specific need...
	 * 
	 * @deprecated since the refactoring to workflows
	 */
	SendUtils = {
		
		sendDocument : function(documentNode, sendByMail) {
			
//			updateDocumentState();
//			moveDocumentToOutbox();
			
//			function updateDocumentState() {
//				
//				documentNode.properties[YammaModel.STATUSABLE_STATUS_PROPNAME] = YammaModel.DOCUMENT_STATE_SENDING;				
//				documentNode.save();
//				
//			}
//						
//			function moveDocumentToOutbox() {
//				
//				var
//					assignedSendingServiceName = getAssignedSendingServiceName(),
//					message = null
//				;
//				
//				if (null != assignedSendingServiceName) {
//					message = DocumentUtils.moveToServiceTray(documentNode, assignedSendingServiceName, YammaModel.TRAY_KIND_OUTBOX);
//				} 
//				else {
//					// Moves the document to the outbox tray of the service
//					message = DocumentUtils.moveToSiblingTray(documentNode, YammaModel.TRAY_KIND_OUTBOX);
//				}
//				
//				if (message) {
//					throw {
//						code : 512,
//						message : 'IllegalStateException! ' + message
//					};			
//				}				
//			}
//			
//			function getAssignedSendingServiceName() {
//				
//				var lastReply = ReplyUtils.getLastReply(documentNode);
//				if (null == lastReply) return null;
//				
//				return lastReply.properties[YammaModel.SENT_BY_POSTAL_SERVICES_ASSIGNED_SERVICE_PROPNAME];
//				
//			}
//						
		}			
	
	}
	
})();