(function() {
	
	const REPLIES_CONTAINER_NAME = 'replies';
	
	ReplyUtils = {
		
		getReplyContainer : function(document, createIfNotExists /* default = true */) {
			
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
		
		addReply : function(document, replyContent, replyType, replyName) {
			
			if (!replyContent) {
				throw new Error('IllegalArgumentException! The reply content is mandatory');
			}
			replyType = replyType || YammaModel.REPLY_TYPE_SHORTNAME;
			
			
			var repliesContainer = ReplyUtils.getReplyContainer(document, /* createIfNotExists */ true);
			var replyNode = UploadUtils.getContainerChildByName(
				repliesContainer, /* container */  
				replyName, /* childName */ 
				{type : replyType}); /* createConfig */
			
			replyNode.properties.content.write(replyContent);
			UploadUtils.updateMimetype(replyNode, replyName);
			UploadUtils.extractMetadata(replyNode);
			
			// fill writing-date if not yet filled
			var writingDate = documentNode.properties[YammaModel.REPLY_WRITING_DATE_PROPNAME];
			if (!writingDate) {
				replyNode.properties[YammaModel.REPLY_WRITING_DATE_PROPNAME] = new Date();
				replyNode.save();
			}			
			
			// create replies association
			document.createAssociation(replyNode, YammaModel.DOCUMENT_REPLY_REPLIES_ASSOCNAME);
			
			return replyNode;
						
		},
		
		getReplies : function(document) {
			
			var repliesContainer = ReplyUtils.getReplyContainer(document, /* createIfNotExists */ false);
			if (!repliesContainer) return [];
			
			return document.assocs[YammaModel.DOCUMENT_REPLY_REPLIES_ASSOCNAME] || [];
			
		},
		
		hasReplies : function(document) {
			
			return 0 !== ReplyUtils.getReplies(document).length;
			
		}
		
	};

})();
