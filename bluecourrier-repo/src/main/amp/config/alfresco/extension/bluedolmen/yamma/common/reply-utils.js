///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/directory-utils.js">
(function() {
	
	var REPLIES_CONTAINER_NAME = 'replies';
	
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
		
		getRepliedDocument : function(replyNode) {
			
			if (null == replyNode) return null;
			return (replyNode.assocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [])[0];
			
		},
		
		getThreadRootDocument : function(node) {
			
			var 
				root = node,
				repliedNode = null
			;
			
			do {
				
				repliedNode = ReplyUtils.getRepliedDocument(root);
				if ( null == repliedNode || !repliedNode.hasPermission('Read') ) {
					return root;
				}
				root = repliedNode;
				
			} while ( true );				
			
			// never reached
		},
		
		/**
		 * 
		 * @param document {ScriptNode}
		 * @param replyNode {ScriptNode}
		 * @param moveInside {boolean} do the reply goes inside the replies container of the replied document ?
		 * @returns
		 */
		addReply : function(document, replyNode, moveInside, omitHistoryEvent) {			
			
			if (null == document || null == replyNode) {
				throw new Error('IllegalArgumentException! document and replyNode parameters are mandatory!');
			}
			
			moveInsideRepliesContainer();
			DocumentUtils.createDocumentContainer(replyNode, true /* moveInside */); // Creates a container for this document
			
			fillWritingDate();
			fillObject();
			fillSignator();
			fillInstructor();
			fillRecipient();
			fillInitialState();
			replyNode.save();

			setSignatureNeeded(); // add aspect => need to perform after save()
			ReplyUtils.setReference(replyNode, document);
			associateToDocument(); // association should be made after setting reference (reference is computed on existing associated replies)
			
			addHistoryEvent();
			
			function moveInsideRepliesContainer() {
				
				if (false === moveInside) return;
				
				var 
					repliesContainer = ReplyUtils.getRepliesContainer(document, /* createIfNotExists */ true),
					replyParent = replyNode.parent
				;
				
				// Move the attachment in the replies container
				if (replyParent != repliesContainer) {
					replyNode.move(repliesContainer);
				}
				
			}
			
			function fillInitialState() {
				var state = replyNode.properties[YammaModel.STATUSABLE_STATUS_PROPNAME];
				if (null == state) {
					replyNode.properties[YammaModel.STATUSABLE_STATUS_PROPNAME] = YammaModel.DOCUMENT_STATE_PENDING;
				}
			}
			
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
					replyNode.properties[YammaModel.MAIL_OBJECT_PROPNAME] = 'Re: ' + ( document.properties[YammaModel.MAIL_OBJECT_PROPNAME] || '');
				}
			}
			
			function fillSignator() {
				
				// The recipient of the incoming document
				
				var
					mapFunctions = []
				;
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_ORGANIZATION_NAME_PROPNAME,
					YammaModel.SENDER_ORGANIZATION_NAME_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_EMAIL_PROPNAME,
					YammaModel.SENDER_EMAIL_PROPNAME 
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_TELEPHONE_PROPNAME,
					YammaModel.SENDER_TELEPHONE_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_ADDRESS_PROPNAME,
					YammaModel.SENDER_ADDRESS_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_POSTCODE_PROPNAME,
					YammaModel.SENDER_POSTCODE_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_CITY_PROPNAME,
					YammaModel.SENDER_CITY_PROPNAME
				));
		
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_COUNTRY_PROPNAME,
					YammaModel.SENDER_COUNTRY_PROPNAME
				));
		
				
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_RECIPIENT_NAME_PROPNAME,
					YammaModel.SENDER_SIGNATOR_NAME_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_JOB_TITLE_PROPNAME,
					YammaModel.SENDER_SIGNATOR_JOB_TITLE_PROPNAME 
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_EMAIL_PROPNAME,
					YammaModel.SENDER_SIGNATOR_EMAIL_PROPNAME 
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.RECIPIENT_TELEPHONE_PROPNAME,
					YammaModel.SENDER_SIGNATOR_TELEPHONE_PROPNAME 
				));
	
				Utils.Alfresco.CopyPropertyUtils.executeCopy(document, replyNode, mapFunctions);
				
			}
			
			function fillInstructor() {
				
				// Use Directory and owner of the replyNode
				
				var owner = Utils.wrapString(replyNode.owner);
				if (null == owner) return;
				
				var contact = DirectoryUtils.getContact(owner);
				if (null == contact) return;
				
				DirectoryUtils.fillInstructor(contact, replyNode);
	
			}
			
			function fillRecipient() {
				
				var
					mapFunctions = []
				;
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_ORGANIZATION_NAME_PROPNAME, 
					YammaModel.RECIPIENT_ORGANIZATION_NAME_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_EMAIL_PROPNAME, 
					YammaModel.RECIPIENT_EMAIL_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_TELEPHONE_PROPNAME, 
					YammaModel.RECIPIENT_TELEPHONE_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_ADDRESS_PROPNAME, 
					YammaModel.RECIPIENT_ADDRESS_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_POSTCODE_PROPNAME, 
					YammaModel.RECIPIENT_POSTCODE_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_CITY_PROPNAME, 
					YammaModel.RECIPIENT_CITY_PROPNAME
				));
		
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_COUNTRY_PROPNAME, 
					YammaModel.RECIPIENT_COUNTRY_PROPNAME
				));
		
				
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_SIGNATOR_NAME_PROPNAME,
					YammaModel.RECIPIENT_RECIPIENT_NAME_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_SIGNATOR_JOB_TITLE_PROPNAME, 
					YammaModel.RECIPIENT_JOB_TITLE_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_SIGNATOR_EMAIL_PROPNAME, 
					YammaModel.RECIPIENT_EMAIL_PROPNAME
				));
				
				mapFunctions.push(Utils.Alfresco.CopyPropertyUtils.getDirectMapOperation(
					YammaModel.SENDER_SIGNATOR_TELEPHONE_PROPNAME, 
					YammaModel.RECIPIENT_TELEPHONE_PROPNAME
				));

				Utils.Alfresco.CopyPropertyUtils.executeCopy(document, replyNode, mapFunctions);
				
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
			
			function addHistoryEvent() {
				
				if (true === omitHistoryEvent) return;
				
				HistoryUtils.addEvent(replyNode, {
					
					eventType : 'addReply',
					key : 'yamma.actions.addReply.comment',
					args : [ replyNode.name ]
					
				});
				
			}
						
			return replyNode;
						
		},

		/**
		 * Set the (internal) reference on the reply-node
		 * @param {ScriptNode} replyNode The reply-node
		 * @param {ScriptNode} documentNode The document-node if not yet associated to the reply
		 */
		setReference : function(replyNode, documentNode) {
			
			if (!replyNode.hasAspect(YammaModel.REFERENCEABLE_ASPECT_SHORTNAME)) {
				replyNode.addAspect(YammaModel.REFERENCEABLE_ASPECT_SHORTNAME);
			}
			var replyReference = ReplyUtils.getReplyReference(replyNode, documentNode);

			if (Utils.String.isBlank(replyNode.properties[YammaModel.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME])) {
				replyNode.properties[YammaModel.REFERENCEABLE_INTERNAL_REFERENCE_PROPNAME] = replyReference;
			}
			
			if (Utils.String.isBlank(replyNode.properties[YammaModel.REFERENCEABLE_REFERENCE_PROPNAME])) {
				replyNode.properties[YammaModel.REFERENCEABLE_REFERENCE_PROPNAME] = replyReference;
			}
			
			replyNode.save();
			
		},
		
		getReplyReference : function(replyNode, documentNode) {
			
			if (null == documentNode) {
				documentNode = ReplyUtils.getRepliedDocument(replyNode);
			}
			
			var documentReference = referenceProvider.getExistingReference(documentNode);
			if (null == documentReference) return null;
			
			if ("true" == ConfigUtils.getConfigValue("reference.reply.relative", "true", ConfigUtils.interpretAsLowerCaseString)) {
				return getRelativeReference();
			}
			else {
				return getAbsoluteReference();
			}
			
			
			function getAbsoluteReference() {
				
				return referenceProvider.getNewReference('yamma' /* providerId */, null /* providerConfig */);
				
			}
			
			function getRelativeReference() {
				
				var 
					existingReplies = ReplyUtils.getReplies(documentNode),
					
					// manage update of an existing reply reference
					replyIndex = Utils.indexOf(existingReplies, 
						function match(v) {
							return Utils.javaEqualsFunction(v, replyNode);
						}
					),
					// TODO: Re-check the logic behind existing reply! It seems meaningless
					nextReplyId = -1 != replyIndex ? replyIndex : (existingReplies.length + 1),
					replyReference = documentReference + '/R' + nextReplyId
				;
				
				return replyReference;
				
			}
			
		},
		
		isReplyReference : function(reference) {
			return /.*\/R[0-9]*$/.test(reference);
		},
		
		removeReply : function(replyNode, omitHistoryEvent) {
			
			var 
				me = this,
				replyContainer = DocumentUtils.getDocumentContainer(replyNode)
			;
			
			addHistoryEvent();
			
			if (null == replyContainer) {
				logger.warn('Cannot get the reply-container. Some valid nodes may still define references on it.');
				replyNode.remove();
				return;
			}
			
			replyContainer.remove();
			
			function addHistoryEvent() {
				
				if (true === omitHistoryEvent) return;
				
				var repliedDocument = me.getRepliedDocument(replyNode);
				if (null == repliedDocument) return;
				
				HistoryUtils.addEvent(repliedDocument, {
					
					eventType : 'removeReply',
					key : 'yamma.actions.removeReply.comment',
					args : [ replyNode.name ]
					
				});
				
			}
			
		},
		
		/**
		 * Returns whether a reply-node get a signed-reply as content
		 */
		isSignedContent : function(replyNode) {
			
			// Currently based on versionning description
			if (!ReplyUtils.isReplyNode(replyNode)) return false;
			
			if (!replyNode.isVersioned) {
				return false;
			}
			
			// The last version should be a 'beforeSigning' version
			var 
				versions = replyNode.versionHistory || [],
				lastVersion = versions[0] 
			;
			if (null == lastVersion) return false;
			return 'beforeSigning' == lastVersion.description;
			
		},
		
		getReplies : function(documentNode, omitUnreadable /* boolean = true */) {
			
			if (null == documentNode) return [];
			
			omitUnreadable = (false !== omitUnreadable);
			replies = documentNode.sourceAssocs[YammaModel.REPLY_REPLY_TO_DOCUMENT_ASSOCNAME] || [];
			
			if (!omitUnreadable) {
				return replies;
			}
			
			return Utils.filter(replies, function accept(reply){
				return reply.hasPermission('Read');
			}); 
			
		},
		
		hasReplies : function(documentNode) {
			
			return 0 !== (ReplyUtils.getReplies(documentNode, false /* omitUnreadable */)).length;
			
		},
		
		getLastReply : function(documentNode) {
			
			var replies = ReplyUtils.getReplies(documentNode);
			return replies[replies.length - 1] || null; // may be undefined
			
		},
		
		/**
		 * Check whether the document is attached with replies that can be
		 * signed.
		 * 
		 * This use-case should be transitional, supporting only the case where
		 * only one reply is attached to a document.
		 * 
		 * This may be invalidated in the future
		 */
		hasSignableReplies : function(documentNode) {
			
			if (!DocumentUtils.isDocumentNode(documentNode)) return false;
			var lastReply = ReplyUtils.getLastReply(documentNode);
			if (null == lastReply) return false;
			
			return ReplyUtils.canBeSigned(lastReply);
			
		},
		
		hasSignedReplies : function(documentNode) {
			
			if (!DocumentUtils.isDocumentNode(documentNode)) return false;
			var lastReply = ReplyUtils.getLastReply(documentNode);
			if (null == lastReply) return false;
			
			return ReplyUtils.isSignedContent(lastReply);
			
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
						DocumentUtils.hasServiceRole(repliedDocument, username, ServicesUtils.SERVICE_ASSISTANT_ROLENAME) &&
						
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
