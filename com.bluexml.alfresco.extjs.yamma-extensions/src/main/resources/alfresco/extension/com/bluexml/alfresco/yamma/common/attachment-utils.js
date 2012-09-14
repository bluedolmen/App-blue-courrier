(function() {
	
	const 
		ATTACHMENTS_CONTAINER_NAME = 'attachments',
		ATTACHMENT_ASSOCNAME = 'cm:attachments'
	;
	
	AttachmentUtils = {
		
			
		getAttachmentsContainer : function(document, createIfNotExists /* default = true */) {
			
			createIfNotExists = ('undefined' == typeof createIfNotExists ? true : !!createIfNotExists);

			/*
			 * Here we may restrict the attachments container to be
			 * inside a DocumentContainer...
			 */			
			var 
				documentParent = document.parent,
				attachmentsContainer = documentParent.childByNamePath(ATTACHMENTS_CONTAINER_NAME);
			if (!attachmentsContainer && createIfNotExists) {
				attachmentsContainer = documentParent.createFolder(ATTACHMENTS_CONTAINER_NAME);
				if (!attachmentsContainer) {
					throw new Error('IllegalStateException! Cannot create a valid container for storing attachments of the document');
				}
			}
			
			return attachmentsContainer;
		},
		
		addAttachment : function(document, attachment) {			
			
			var 
				attachmentsContainer = AttachmentUtils.getAttachmentsContainer(document, /* createIfNotExists */ true),
				attachmentParent = attachment.parent
			;
			
			// Move the attachment in the document fitted container
			if (!attachmentParent || !attachmentParent.hasPermission('Read') || attachmentParent != attachmentsContainer) {
				attachment.move(attachmentsContainer);
			}
			
			// create attachments association
			document.createAssociation(attachment, ATTACHMENT_ASSOCNAME);
			
			return attachment;
						
		},
		
		deleteAttachment : function(attachment) {
			if (!attachment) {
				throw new Error('IllegalArgumentException! The provided attachment is not valid');
			}
			
			var attachingDocument = (attachment.sourceAssocs[ATTACHMENT_ASSOCNAME] || [])[0];
			if (!attachingDocument) {
				throw new Error('IllegalStateException! The provided attachment document is not attached to any document');
			}
			
			// remove the association between the attaching-document and the attachment
			attachingDocument.removeAssociation(attachment, ATTACHMENT_ASSOCNAME);
			
			// finally delete the attachment node
			attachment.remove();
		},
		
		getAttachments : function(document) {
						
			return document.assocs[ATTACHMENT_ASSOCNAME] || [];
			
		},
		
		hasAttachments : function(document) {
			
			return 0 !== AttachmentUtils.getAttachments(document).length;
			
		},
		
		canDelete : function(attachmentNode, username) {
			
			if (!attachmentNode) return false;			
			
			var 
				attachingDocument = (attachmentNode.sourceAssocs[ATTACHMENT_ASSOCNAME] || [])[0],
				canAttach = AttachmentUtils.canAttach(attachingDocument) 
			;
				
			return canAttach;
			
		},
		
		canAttach : function(documentNode, username) {
			
			if (!documentNode) return false;
			return documentNode.hasPermission('Write');
			
		}
		
		
	};

})();
