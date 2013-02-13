(function() {
	

	/**
	 * This object stores the checking of available actions on a Document.
	 */
	ActionUtils = {
		
		getAvailableActionNames : function() {
			
			var methodName, actionNames = [];
			
			for (methodName in ActionUtils) {
				if (methodName.indexOf('can') != 0) continue;
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
			
			username = username || Utils.Alfresco.getCurrentUserName();
						
			return (
				
				/* Document is original */					
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
				
				DocumentUtils.checkDocumentState(documentNode, [ 
					YammaModel.DOCUMENT_STATE_PENDING, 
					YammaModel.DOCUMENT_STATE_DELIVERING,
					YammaModel.DOCUMENT_STATE_PROCESSING 
				] ) &&
				
				/* Document target service is assigned */
				DocumentUtils.hasAssignedService(documentNode) &&
				
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
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
				
				/* Document is in 'delivering' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_DELIVERING) &&
				
				/* Document is delivered */
				DocumentUtils.isDocumentDelivered(documentNode) &&
		
				(				
				
					/* Document is assigned to the current user */
					DocumentUtils.isAssignedAuthority(documentNode, username) ||
				
					(
						/* Document has an assigned user */
						DocumentUtils.hasAssignedAuthority(documentNode) &&
						
						/* The user is an assistant of the service */
						DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')
					)
					
				)
				
			);
			
		},
		
		/**
		 * A user can reply to an inbound document if:
		 * - The document is in processing state
		 * - He is the assigned user
		 */
		canReply : function(documentNode, username) {
			
			username = username || Utils.Alfresco.getCurrentUserName();			
			
			return (
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
				
				/* Document is a kind of inbound document */
				documentNode.hasAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME) &&						
				
				/* Document is in 'processing' or 'revising' state */
				DocumentUtils.checkDocumentState(documentNode, 
					[ 
						YammaModel.DOCUMENT_STATE_PROCESSING, 
						YammaModel.DOCUMENT_STATE_REVISING
					]
				) &&
				
				(
					/* The user is the currently assigned user */
					DocumentUtils.isAssignedAuthority(documentNode, username) ||
					
					/* The user is an assistant of the service */
					DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')
				)
				
			);
			
		},		
		
		/**
		 * A user can send an Outbound (Mail) if:
		 * - The document is in processing state
		 * - He is the assigned user
		 * - The document is an Outbound Mail OR the document has replies
		 */
		canSendOutbound : function(documentNode, username) {
			
			username = username || Utils.Alfresco.getCurrentUserName();			
			
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
				DocumentUtils.checkDocumentState(documentNode, 
					[ 
						YammaModel.DOCUMENT_STATE_PROCESSING, 
						YammaModel.DOCUMENT_STATE_REVISING
					]
				) &&
				
				(
					/* The user is the currently assigned user */
					DocumentUtils.isAssignedAuthority(documentNode, username) ||
					
					/* The user is an assistant of the service */
					DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')
				)
				
			);
			
		},
		
		canSkipValidation : function(documentNode, username) {
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			return (
			
				/* The user is the currently assigned user */
				DocumentUtils.isAssignedAuthority(documentNode, username) ||
				
				/* The user is an assistant of the service */
				DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')
				
			);
			
		},
		
		/**
		 * A user can attach a document if:
		 * - The document is original
		 * - The user can attach documents
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
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'validating-processed' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_VALIDATING_PROCESSED) &&				
				
				(
					/* the user is the current service manager */
					DocumentUtils.isServiceManager(documentNode, username) ||
					
					/* The user is an assistant of the service */
					DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')
				)				
				
			);
		

		},
		
		canMarkAsSigned : function(documentNode, username) {
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'signing' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_SIGNING) &&
				
				(
					/* the user is the current service manager */
					DocumentUtils.isServiceManager(documentNode, username) ||
					
					/* The user is an assistant of the service */
					DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')
				)				
				
			);
			
		},		
		
		canMarkAsSent : function(documentNode, username) {
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'sending' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_SENDING) &&
				
				/* The user is an assistant of the service */
				DocumentUtils.hasServiceRole(documentNode, username, 'ServiceAssistant')				
								
			);
			
		},
		
		canArchive : function(documentNode, username) {
			
			username = username || Utils.Alfresco.getCurrentUserName();
			
			return (
					
				/* Document is original */
				DocumentUtils.isOriginalDocumentNode(documentNode) &&
					
				/* Document is in 'processed' state */
				DocumentUtils.checkDocumentState(documentNode, YammaModel.DOCUMENT_STATE_PROCESSED)
								
			);
			
		}
		
		
	};

})();
