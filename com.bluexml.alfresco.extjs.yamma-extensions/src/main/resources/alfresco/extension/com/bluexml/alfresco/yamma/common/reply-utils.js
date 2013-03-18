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
			
			if (null == node) return false;
			return node.hasAspect(YammaModel.REPLY_ASPECT_SHORTNAME);
			
		},
			
		getRepliesContainer : function(document, createIfNotExists /* default = true */) {
			
			if (!DocumentUtils.isDocumentNode(document)) {
				throw new Error('IllegalArgumentException! The provided document is not valid.');
			}
			createIfNotExists = ('undefined' == typeof createIfNotExists ? true : !!createIfNotExists);
			
			var repliesContainer = DocumentUtils.getDocumentSubContainer(document, REPLIES_CONTAINER_NAME, createIfNotExists);			
			return repliesContainer;
		},
		
		addReply : function(document, replyNode) {			
			
			if (null == document || null == replyNode) {
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
			fillObject();
			fillCorrespondent();
			fillRecipient();
			replyNode.save();
			
			setSignatureNeeded(); // add aspect => need to perform after save()
			associateToDocument();
			
			function fillWritingDate() {
				var writingDate = replyNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME];
				// fill writing-date if not yet filled
				if (null == writingDate) {
					replyNode.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = new Date();
				}				
			}
			
			function fillObject() {
				var object = replyNode.properties[YammaModel.MAIL_OBJECT_PROPNAME];
				if (null == object) {
					replyNode.properties[YammaModel.MAIL_OBJECT_PROPNAME] = 'Re: ' + document.properties[YammaModel.MAIL_OBJECT_PROPNAME];
				}
			}
			
			function fillCorrespondent() {
				var assignedAuthority = DocumentUtils.getAssignedAuthority(document) || person;
				if (null == assignedAuthority) return;
				
				var
					firstName = assignedAuthority.properties['cm:firstName'],
					lastName = assignedAuthority.properties['cm:lastName'],
					telephone = 
						assignedAuthority.properties['cm:companytelephone'] ||
						assignedAuthority.properties['cm:telephone'] || 
						assignedAuthority.properties['cm:mobile'],
					email = 
						assignedAuthority.properties['cm:companyemail'] ||
						assignedAuthority.properties['cm:email'],
					address = Utils.String.trim( 
						(assignedAuthority.properties['cm:companyaddress1'] || '') + ' ' +
						(assignedAuthority.properties['cm:companyaddress2'] || '') + ' ' +
						(assignedAuthority.properties['cm:companyaddress3'] || '')
					)
				;
				
				replyNode.properties[YammaModel.CORRESPONDENT_NAME_PROPNAME] = Utils.String.trim(lastName + ' ' + firstName) || null;
				replyNode.properties[YammaModel.CORRESPONDENT_ADDRESS_PROPNAME] = address || null;
				replyNode.properties[YammaModel.CORRESPONDENT_CONTACT_EMAIL_PROPNAME] = email || null;
				replyNode.properties[YammaModel.CORRESPONDENT_CONTACT_PHONE_PROPNAME] = telephone || null;				
				
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
	                ],
	                i, len,
	                sourcePropertyName, targetPropertyName,
	                sourcePropertyValue, targetPropertyValue
				;
				
				// fill recipient information
				for (i = 0, len = sourceProperties.length; i < len; i++) {
					
					targetPropertyName = targetProperties[i];
					targetPropertyValue = replyNode.properties[targetPropertyName];
					if (targetPropertyValue != null) continue; // skip if already set
					
					sourcePropertyName = sourceProperties[i];
					sourcePropertyValue = document.properties[sourcePropertyName];
					replyNode.properties[targetPropertyName] = sourcePropertyValue;
					
				}
				
			}
			
			function setSignatureNeeded(signatureNeeded) {
				
				if (false === signatureNeeded) return;
				
				if (!replyNode.hasAspect(YammaModel.SIGNABLE_ASPECT_SHORTNAME)) {
					replyNode.addAspect(YammaModel.SIGNABLE_ASPECT_SHORTNAME);
				}
				replyNode.properties[YammaModel.SIGNABLE_NEEDS_SIGNATURE_PROPNAME] = true;
				replyNode.save();
				
			}
			
			function associateToDocument() {
				if (!replyNode.hasAspect(YammaModel.REPLY_ASPECT_SHORTNAME)) {
					replyNode.addAspect(YammaModel.REPLY_ASPECT_SHORTNAME);
				}
				replyNode.createAssociation(document, YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME);
			}
						
			return replyNode;
						
		},
		
		removeReply : function(replyNode) {
			var 
				replyContainer = DocumentUtils.getDocumentContainer(replyNode)
			;
			
			if (null == replyContainer) {
				logger.warn('Cannot get the reply-container. Some valid nodes may still define references on it.');
				replyNode.remove();
				return;
			}
			
			replyContainer.remove();
			
		},
		
		getReplies : function(documentNode) {
			
			if (null == documentNode) return [];			
			return documentNode.sourceAssocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [];
			
		},
		
		hasReplies : function(documentNode) {
			
			return 0 !== ReplyUtils.getReplies(documentNode).length;
			
		},
		
		getLastReply : function(documentNode) {
			
			var
				replies = ReplyUtils.getReplies(documentNode)
			;
			return replies[replies.length - 1]; // may be undefined
			
		},
		
		/**
		 * Check whether the document is attached with replies that can be
		 * signed.
		 * 
		 * This use-case should be transitional supporting only the case where
		 * only one reply is attached to a document.
		 * 
		 * This may be invalidated in the future
		 */
		hasSignableReplies : function(documentNode) {
			
			if (!DocumentUtils.isDocumentNode(documentNode)) return false;
			
			var 
				replies = ReplyUtils.getReplies(documentNode)
			;
			
			return Utils.exists(replies,
				function(replyNode) {
					return ReplyUtils.canBeSigned(replyNode);
				} // acceptFunction
			);
			
		},		
		
		getRepliedDocument : function(replyNode) {
			
			if (null == replyNode) return null;
			return (replyNode.assocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [])[0];
			
		},
		

		/**
		 * A user can attach a document to a reply if he can still reply to
		 * the original (replied) document.
		 */
		canAttach : function(replyNode, username) {
			
			if (!ReplyUtils.isReplyNode(replyNode)) return false;			
				
			var 
				repliedDocument = ReplyUtils.getRepliedDocument(replyNode),
				canAttach = AttachmentUtils.canAttach(repliedDocument) && ActionUtils.canReply(repliedDocument, username)
			;
				
			return canAttach;
			
		},
		
		canUpdate : function(replyNode, username) {
			
			var
				repliedDocument =  ReplyUtils.getRepliedDocument(replyNode),
				canUpdate = (
					replyNode.hasPermission('Write') && 
					ActionUtils.canReply(repliedDocument, username) ||
					
					(
						/* The user is an assistant of the service */
						DocumentUtils.hasServiceRole(repliedDocument, username, 'ServiceAssistant') &&
						
						DocumentUtils.checkDocumentState(repliedDocument, 
							[ 
								YammaModel.DOCUMENT_STATE_VALIDATING,
								YammaModel.DOCUMENT_STATE_SIGNING,
								YammaModel.DOCUMENT_STATE_SENDING
							]
						)
						
					)
					
				)
			;
			
			return canUpdate;
			
		},
		
		canDelete : function(replyNode, username) {
			
			if (!ReplyUtils.isReplyNode(replyNode)) return false;			
			
			var 
				repliedDocument =  ReplyUtils.getRepliedDocument(replyNode),
				canDelete = replyNode.hasPermission('Write') && ActionUtils.canReply(repliedDocument, username)
			;
				
			return canDelete;
			
		},
		
		canBeSigned : function(replyNode, username) {
			
			function replyNeedsSignature(replyNode) {
				var needsSignature = replyNode.properties[YammaModel.SIGNABLE_NEEDS_SIGNATURE_PROPNAME] || false;	
				return needsSignature;
			}
			
			if (!ReplyUtils.isReplyNode(replyNode)) return false;
			return replyNeedsSignature(replyNode);
			
		}
				
		
	};

})();
