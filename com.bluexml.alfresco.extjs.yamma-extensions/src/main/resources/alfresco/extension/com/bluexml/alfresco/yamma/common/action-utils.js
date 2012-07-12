(function() {	

	ActionUtils = {
		
		/**
		 * A user can distribute a document if:
		 * - The target service is assigned
		 * - The target service is not the current one (1+2 are verified by isDocumentDelivered)
		 * - The document is not a copy
		 * 
		 */
		canDistribute : function(documentNode, username) {
			
			if (!DocumentUtils.isDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var isDocumentDelivered = DocumentUtils.isDocumentDelivered(documentNode);
			var isCopy = DocumentUtils.isCopy(documentNode);
			
			return (!isDocumentDelivered && !isCopy);
			
		},
		
		/**
		 * A user can take processing of a document if:
		 * - The document is in delivering state
		 * - The document is delivered to the right service
		 * - He is the assigned user
		 * - The document is not a copy 
		 */
		canTakeProcessing : function(documentNode, username) {
			
			if (!DocumentUtils.isDocumentNode(documentNode)) return false;
			username = username || Utils.getCurrentUserName();
			
			var assignedAuthority = DocumentUtils.getAssignedAuthority(documentNode);
			var assignedAuthorityUserName = Utils.getPersonUserName(assignedAuthority);
			
			var isDocumentDelivered = DocumentUtils.isDocumentDelivered(documentNode);
			var isDocumentDelivering = DocumentUtils.isDocumentDelivering(documentNode);
			var isCopy = DocumentUtils.isCopy(documentNode);
			
			return (
				isDocumentDelivering &&
				isDocumentDelivered && 
				!isCopy &&
				(assignedAuthorityUserName === username)
			);
			
		}
		
		
	};

})();
