(function(){
	
	UploadUtils = {
		
		updateMimetype : function(node, filename) {
			
			if (null == node) return; // do nothing
			
			if (filename) {
				node.properties.content.guessMimetype(filename);
			}
				
			node.properties.content.guessEncoding();
			node.save();		
		},
		
		extractMetadata : function(node) {
			if (null == node) return;
			
			var emAction = actions.create("extract-metadata");
			if (emAction == null) return;
			
			emAction.execute(node, false /* readOnly */, false /* newTransaction */);
		},
		
		getContainerChildByName : function(container, childName, createConfig) {
			
			if (null == container) {
				throw new Error('IllegalArgumentException! The provided container is not a valid container');
			}
			childName = ('undefined' == typeof childName ? null : childName);
			createConfig = ('undefined' == typeof createConfig ? null : createConfig);
			
			var child = childName ? container.childByNamePath(childName) : null;
			if (!child && createConfig) {
				if (Utils.isFunction(createConfig)) {
					child = createConfig(container, childName);
				} else {
					child = container.createNode(childName, createConfig.type || 'cm:content', createConfig.assocType || 'cm:contains');
				}
			}
			
			return child;
		},
		
		/**
		 * See config inside function definition
		 */
		updateContent : function(updatedNode, newContent, config) {
			
			config = config || {};

			var
				filename = config.filename || undefined,
				mimetype = config.mimetype || undefined,
				versionLabel = config.versionLabel || undefined,
				doExtractMetadata = false !== config.doExtractMetadata, /* default = true */
				doGuessEncoding = false !== config.doGuessEncoding, /* default = true */
				fullRename = true === config.fullRename /* default = false */
			;
			
			
			if (versionLabel) {
				updatedNode.ensureVersioningEnabled(false /* autoVersion */, false /* autoVersionProps */);
				updatedNode.createVersion(versionLabel /* history */, true /* majorVersion */);
			}

			// update content
			updatedNode.properties.content.write(newContent, true /* applyMimetype */, doGuessEncoding /* guessEncoding */);
			
			if (null != filename) {
				renameFile(filename);
				if (null == mimetype) updatedNode.properties.content.guessMimetype(filename);
			}
			
			if (null != mimetype) {
				updatedNode.properties.content.setMimetype(mimetype);
			}
			
			if (doExtractMetadata) {
				UploadUtils.extractMetadata(updatedNode);
			}
			
			// end
			
			
			function renameFile(filename) {
				
				filename = Utils.asString(filename);
				var 
					replyFileName = Utils.asString(updatedNode.properties['cm:name']),
					newReplyFileName = filename
				;
				
				if (replyFileName == filename) return;
				
				if (!fullRename) {
					
					// try to update extension if necessary regarding the provided filename
					var 
						replyExtension = getFileExtension(replyFileName),
						newReplyExtension = getFileExtension(filename)
					;
					
					if (replyExtension == newReplyExtension) return;
					newReplyFileName = replyExtension ?
						replyFileName.replace(replyExtension, newReplyExtension)
						: replyFileName + newReplyExtension
					;
					
				}
				
				updatedNode.properties['cm:name'] = newReplyFileName;
				updatedNode.save();
				
			}
			
			function getFileExtension(fileName) {
				
				if (null == fileName) return null;
				
				var
					lastDotIndex = fileName.lastIndexOf('.'),
					extension = -1 != lastDotIndex ? fileName.substr(lastDotIndex) : ''
				;
				
				return extension;
				
			}
			
			
		}
		
		
	};
	
})();