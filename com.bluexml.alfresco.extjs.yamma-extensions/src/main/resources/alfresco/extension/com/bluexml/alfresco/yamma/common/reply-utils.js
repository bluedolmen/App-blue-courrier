(function() {
	
	const REPLIES_CONTAINER_NAME = 'replies';
	
	ReplyUtils = {

		/**
		 * Determines whether the provided node is a Reply Node.
		 * 
		 * @param {ScriptNode}
		 *            node the node to test
		 * @return {Boolean} true if the provided node is a reply-node
		 *         (or one of its derivative)
		 */
		isReplyNode : function(node) {
			
			if (!node) return false;
			return node.isSubType(YammaModel.REPLY_TYPE_SHORTNAME);
			
		},
			
		getRepliesContainer : function(document, createIfNotExists /* default = true */) {
			
			if (!DocumentUtils.isDocumentNode(document)) {
				throw new Error('IllegalArgumentException! The provided document is not valid.');
			}
			createIfNotExists = ('undefined' == typeof createIfNotExists ? true : !!createIfNotExists);
			
			var documentContainer = DocumentUtils.getDocumentContainer(document);
			if (!documentContainer) {
				throw new Error('IllegalStateException! Cannot get a valid container for the document');
			}
			
			var repliesContainer = documentContainer.childByNamePath(REPLIES_CONTAINER_NAME);
			if (!repliesContainer && createIfNotExists) {
				repliesContainer = documentContainer.createFolder(REPLIES_CONTAINER_NAME);
				if (!repliesContainer) {
					throw new Error('IllegalStateException! Cannot create a valid container for storing replies of the document');
				}
			}
			
			return repliesContainer;
		},
		
		addReply : function(document, replyNode) {			
			
			if (!document || !replyNode) {
				throw new Error('IllegalArgumentException! document and replyNode parameters are mandatory!');
			}
			
			var 
				repliesContainer = ReplyUtils.getRepliesContainer(document, /* createIfNotExists */ true),
				replyParent = replyNode.parent
			;
			
			// Move the attachment in the replies container
			if (replyParent != repliesContainer) {
				replyNode.move(repliesContainer);
			}
			
			DocumentUtils.createDocumentContainer(replyNode, true /* moveInside */); // Creates a container for this document
			
			fillWritingDate();
			fillRecipient();
			fillCorrespondent();
			replyNode.save();
			
			// create replyTo association
			replyNode.createAssociation(document, YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME);
			
			function fillCorrespondent() {
				// Correspondent is the current user
			}
			
			function fillWritingDate() {
				var writingDate = replyNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
				// fill writing-date if not yet filled
				if (!writingDate) {
					replyNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
				}				
			}
			
			function fillRecipient() {
				
				var
					sourceProperties = [
	                    YammaModel.CORRESPONDENT_NAME_PROPNAME,
	                    YammaModel.CORRESPONDENT_ADDRESS_PROPNAME,
	                    YammaModel.CORRESPONDENT_CONTACT_EMAIL_PROPNAME,
	                    YammaModel.CORRESPONDENT_CONTACT_PHONE_PROPNAME
	                ],
					targetProperties = [
	                    YammaModel.RECIPIENT_NAME_PROPNAME,
	                    YammaModel.RECIPIENT_ADDRESS_PROPNAME,
	                    YammaModel.RECIPIENT_CONTACT_EMAIL_PROPNAME,
	                    YammaModel.RECIPIENT_CONTACT_PHONE_PROPNAME
	                ]
				;
				
				// fill recipient information
				for (var i = 0, len = sourceProperties.length; i++; i < len) {
					
					var 
						sourcePropertyName = sourceProperties[i],
						targetPropertyName = targetProperties[i],
						sourcePropertyValue = document.properties[sourcePropertyName],
						targetPropertyValue = replyNode.properties[targetPropertyName]
					;
					
					if (targetPropertyValue != null) { // if not already set
						targetNode.properties[propertyName] = sourcePropertyValue;
					}
					
				}
				
			}
						
			return replyNode;
						
		},
		
		removeReply : function(replyNode) {
			var 
				replyContainer = DocumentUtils.getDocumentContainer(replyNode)
			;
			
			if (!replyContainer) {
				logger.warn('Cannot get the reply-container. Some valid nodes may still define references on it.');
				replyNode.remove();
				return;
			}
			
			replyContainer.remove();
			
		},
		
		getReplies : function(document) {
			
			if (!document) return [];
			
//			// This couple of lines ensures that the replies container actually exists
//			// Not sure this should be enforced!
//			var repliesContainer = ReplyUtils.getRepliesContainer(document, /* createIfNotExists */ false);
//			if (!repliesContainer) return [];

			return document.sourceAssocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [];
//			return repliesContainer.childrenByXPath('*[subtypeOf("' + YammaModel.REPLY_TYPE_SHORTNAME + '")]') || [];
			
		},
		
		getRepliedDocument : function(replyNode) {
			
			if (!replyNode) return null;
			return (replyNode.assocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [])[0];
			
		},
		
		hasReplies : function(document) {
			
			return 0 !== ReplyUtils.getReplies(document).length;
			
		},
		

		/**
		 * A user can attach a document to a reply if he can still reply to
		 * the original (replied) document.
		 */
		canAttach : function(replyNode, username) {
			
			if (!ReplyUtils.isReplyNode(replyNode)) return false;			
				
			var 
				repliedDocument = (replyNode.assocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [])[0],
				canAttach = AttachmentUtils.canAttach(repliedDocument) && ActionUtils.canReply(repliedDocument, username)
			;
				
			return canAttach;
			
		},
		
		canDelete : function(replyNode, username) {
			
			if (!ReplyUtils.isReplyNode(replyNode)) return false;			
			
			var 
				repliedDocument = (replyNode.assocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [])[0],
				canDelete = replyNode.hasPermission('Write') && ActionUtils.canReply(repliedDocument, username)
			;
				
			return canDelete;
			
		}
				
		
	};

})();
