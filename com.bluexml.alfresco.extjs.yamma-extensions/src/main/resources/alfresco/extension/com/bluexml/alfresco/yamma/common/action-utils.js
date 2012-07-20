(function() {	

	ActionUtils = {
		
		/**
		 * A user can distribute a document if:
		 * - The target service is assigned
		 * - The target service is not the current one
		 * 
		 */
		canDistribute : function(documentNode, username) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var isTargetServiceAssigned = !!DocumentUtils.getAssignedService(documentNode);
			var isDocumentDelivered = DocumentUtils.isDocumentDelivered(documentNode);
			
			return (
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
			
			var isDocumentDelivered = DocumentUtils.isDocumentDelivered(documentNode);
			var isDocumentDelivering = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_DELIVERING);
			var isCurrentAssignedUser = DocumentUtils.isAssignedAuthority(documentNode, username); 
			
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
			
			var isDocumentProcessing = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PROCESSING);
			var isCurrentAssignedUser = DocumentUtils.isAssignedAuthority(documentNode, username); 
			
			return (
				isDocumentProcessing &&
				isCurrentAssignedUser
			);
			
		},
		
		/**
		 * A user can validate a document if:
		 * - The document is in validating state
		 * - He is a service manager
		 */
		canValidate : function(documentNode, username) {
			
			if (!DocumentUtils.isOriginalDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var isDocumentValidating = DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED);
			var isServiceManager = DocumentUtils.isServiceManager(documentNode, username);
			
			return (
				isDocumentValidating &&
				isServiceManager
			);

		}
		
		
	};

})();
