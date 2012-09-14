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
		 * A user can reply to a document if:
		 * - The document is in processing state
		 * - He is the assigned user
		 */
		canReply : function(documentNode, username) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var 
				isDocumentProcessing = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PROCESSING),
				isCurrentAssignedUser = DocumentUtils.isAssignedAuthority(documentNode, username)
			; 
			
			return (
				isDocumentProcessing &&
				isCurrentAssignedUser
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
