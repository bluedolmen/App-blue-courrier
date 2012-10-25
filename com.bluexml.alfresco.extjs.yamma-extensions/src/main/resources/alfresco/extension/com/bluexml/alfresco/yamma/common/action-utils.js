(function() {
	

	/**
	 * This object stores the checking of available actions on a Document.
	 */
	ActionUtils = {
		
		getAvailableActionNames : function() {
			
			var actionNames = [];
			
			for (var methodName in ActionUtils) {
				if (!(methodName.indexOf('can') == 0)) continue;
				actionNames.push(methodName);
			}
			
			return actionNames;
			
		},
		
		/**
		 * A user can distribute a document if:
		 * - The document is in pending or delivering state
		 * - The target service is assigned
		 * - The target service is not the current one
		 */
		canDistribute : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();
						
			return (
				
				/* Document is original */					
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
				
				(
						/* Document is in 'pending' state */
						DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PENDING) ||
						
						/* Document is in 'delivering' state */
						DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_DELIVERING)
				) &&
				
				/* Document target service is assigned */
				!!DocumentUtils.getAssignedService(documentNode) &&
				
				/* Document is delivered */
				!DocumentUtils.isDocumentDelivered(documentNode)
			);
			
		},
		
		/**
		 * A user can take processing of a document if:
		 * - The document is in delivering state
		 * - The document is delivered to the right service
		 * - He is the assigned user
		 */
		canTakeProcessing : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
				
				/* Document is in 'delivering' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_DELIVERING) &&
				
				/* Document is delivered */
				DocumentUtils.isDocumentDelivered(documentNode) &&
				
				/* Document is assigned to the current user */
				DocumentUtils.isAssignedAuthority(documentNode, username)
				
			);
			
		},
		
		/**
		 * A user can reply to an inbound document if:
		 * - The document is in processing state
		 * - He is the assigned user
		 */
		canReply : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();			
			
			return (
					/* Document is original */
					DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
					/* Document is a kind of inbound document */
					documentNode.hasAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME) &&						
					
					/* Document is in 'processing' state */
					DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PROCESSING) &&
					
					/* the user is the currently assigned user */
					DocumentUtils.isAssignedAuthority(documentNode, username)
				);
			
		},		
		
		/**
		 * A user can send an Outbound (Mail) if:
		 * - The document is in processing state
		 * - He is the assigned user
		 * - The document is an Outbound Mail OR the document has replies
		 */
		canSendOutbound : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();			
			
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
			
			return (
					
					/* Document is original */
					DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
					/* Document is in 'pending' state */
					DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PENDING) &&
					
					/* Document can contain attachments */
					AttachmentUtils.canAttach(documentNode)
					
			);
						
		},
		
		
		/**
		 * A user can validate a document if:
		 * - The document is in validating state
		 * - He is a service manager
		 */
		canValidate : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'validating-processed' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED) &&
				
				/* the user is the current service manager */
				DocumentUtils.isServiceManager(documentNode, username)
				
			);
		

		},
		
		canMarkAsSent : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'sending' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_SENDING)
								
			);
			
		},
		
		canArchive : function(documentNode, username) {
			
			username = username || Utils.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'processed' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PROCESSED)
								
			);
			
		}
		
		
	};

})();
