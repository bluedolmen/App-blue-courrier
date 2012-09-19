(function() {
	

	/**
	 * This object stores the checking of available actions on a Document.
	 */
	ActionUtils = {
		
		/**
		 * A user can distribute a document if:
		 * - The document is in pending or delivering state
		 * - The target service is assigned
		 * - The target service is not the current one
		 */
		canDistribute : function(documentNode, username) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var 
				isTargetServiceAssigned = !!DocumentUtils.getAssignedService(documentNode),
				isDocumentDelivered = DocumentUtils.isDocumentDelivered(documentNode),
				isDocumentPending = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PENDING),
				isDocumentDelivering = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_DELIVERING)
			;
			
			return (
				(isDocumentPending || isDocumentDelivering) &&
				isTargetServiceAssigned &&
				!isDocumentDelivered 
			);
			
		},
		
		/**
		 * A user can take processing of a document if:
		 * - The document is in delivering state
		 * - The document is delivered to the right service
		 * - He is the assigned user
		 */
		canTakeProcessing : function(documentNode, username) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var 
				isDocumentDelivered = DocumentUtils.isDocumentDelivered(documentNode),
				isDocumentDelivering = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_DELIVERING),
				isCurrentAssignedUser = DocumentUtils.isAssignedAuthority(documentNode, username)
			; 
			
			return (
				isDocumentDelivering &&
				isDocumentDelivered && 
				isCurrentAssignedUser
			);
			
		},
		
		/**
		 * A user can send an Outbound (Mail) if:
		 * - The document is in processing state
		 * - He is the assigned user
		 * - The document is an Outbound Mail OR the document has replies
		 */
		canSendOutbound : function(documentNode, username) {
			
			return (
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				(
					/* Document is an OutboundMail */
					documentNode.isSubType(YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME) ||
					
					/* Document has replies */
					ReplyUtils.hasReplies(documentNode) 
				
				) &&
				
				/* Document is in 'processing' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PROCESSING) &&
				
				/* the user is the currently assigned user */
				DocumentUtils.isAssignedAuthority(documentNode, username)
			);
			
		},
		
		/**
		 * A user can attach a document if:
		 * - The document is original
		 * - The user can edit the document
		 * - The document is in pending state
		 */
		canAttach : function(documentNode, username /* not used */) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
							
			var isDocumentPending = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PENDING);
			return AttachmentUtils.canAttach(documentNode) && isDocumentPending;				
			
		},
		
		
		/**
		 * A user can validate a document if:
		 * - The document is in validating state
		 * - He is a service manager
		 */
		canValidate : function(documentNode, username) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var 
				isDocumentValidating = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED),
				isServiceManager = DocumentUtils.isServiceManager(documentNode, username)
			;
			
			return (
				isDocumentValidating &&
				isServiceManager
			);

		}
		
		
	};

})();
