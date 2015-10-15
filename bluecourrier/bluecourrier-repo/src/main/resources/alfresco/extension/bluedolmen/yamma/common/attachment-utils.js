(function() {
	
	var 
		ATTACHMENTS_CONTAINER_NAME = 'attachments',
		ATTACHMENT_ASSOCNAME = 'cm:attachments'
	;
	
	AttachmentUtils = {
		
			
		getAttachmentsContainer : function(document, createIfNotExists /* default = true */) {
			
			createIfNotExists = ('undefined' == typeof createIfNotExists ? true : !!createIfNotExists);

			var attachmentsContainer = DocumentUtils.getDocumentSubContainer(document, ATTACHMENTS_CONTAINER_NAME, createIfNotExists /* createIfNotExists */);
			return attachmentsContainer;
			
		},
		
		addAttachment : function(document, attachment) {			
			
			var 
				attachmentsContainer = AttachmentUtils.getAttachmentsContainer(document, /* createIfNotExists */ true),
				attachmentParent = attachment.parent
			;
			
			// Move the attachment in the document fitted container
			if (null == attachmentParent || !attachmentParent.hasPermission('Read') || attachmentParent != attachmentsContainer) {
				attachment.move(attachmentsContainer);
			}
			
			// create attachments association if it does not yet exist
			createAssociationIfNecessary();
			
			return attachment;
			
			
			function createAssociationIfNecessary() {
				
				var existingAssociations = document.assocs[ATTACHMENT_ASSOCNAME] || [];
				if (
					Utils.exists(existingAssociations, function(target) {
						return target.equals(attachment);
					})
				) return;
				
				document.createAssociation(attachment, ATTACHMENT_ASSOCNAME);
			
			}
						
		},
		
		deleteAttachment : function(attachment) {
			
			if (null == attachment) {
				throw new Error('IllegalArgumentException! The provided attachment is not valid');
			}
			
			var attachingDocument = AttachmentUtils.getAttachingDocument(attachment);
			if (null == attachingDocument) {
				throw new Error('IllegalStateException! The provided attachment document is not attached to any document');
			}
			
			// remove the association between the attaching-document and the attachment
			attachingDocument.removeAssociation(attachment, ATTACHMENT_ASSOCNAME);
			
			// finally delete the attachment node
			attachment.remove();
			
			return attachingDocument;
			
		},
		
		getAttachingDocument : function(attachment) {
			
			if (null == attachment) return null;			
			return (attachment.sourceAssocs[ATTACHMENT_ASSOCNAME] || [null])[0];
			
		},
		
		getAttachments : function(document) {
						
			return document.assocs[ATTACHMENT_ASSOCNAME] || [];
			
		},
		
		hasAttachments : function(document) {
			
			return 0 !== AttachmentUtils.getAttachments(document).length;
			
		},
		
		canDelete : function(attachmentNode, username) {
			
			if (null == attachmentNode) return false;			
			
			var 
				attachingDocument = (attachmentNode.sourceAssocs[ATTACHMENT_ASSOCNAME] || [])[0],
				canAttach = AttachmentUtils.canAttach(attachingDocument) 
			;
				
			return canAttach;
			
		},
		
		canAttach : function(documentNode, username) {
			
			if (null == documentNode) return false;
			return documentNode.hasPermission('Write');
			
		}
		
		
	};

})();
