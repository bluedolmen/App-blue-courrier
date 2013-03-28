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
			
			config = {
				
				filename : config.filename || undefined,
				mimetype : config.mimetype || undefined,
				versionLabel : config.doVersion || undefined,
				doExtractMetadata : false !== config.doExtractMetadata, /* default = true */
				doGuessEncoding : false !== config.doGuessEncoding, /* default = true */
				fullRename : true === config.fullRename /* default = false */
				
			};
			
			if (config.versionLabel) {
				updatedNode.ensureVersioningEnabled(false /* autoVersion */, false /* autoVersionProps */);
				updatedNode.createVersion(versionLabel /* history */, true /* majorVersion */);
			}

			// update content
			updatedNode.properties.content.write(newContent, true /* applyMimetype */, config.doGuessEncoding /* guessEncoding */);
			
			var filename = config.filename;
			if (null != filename) {
				renameFile(filename);
				updatedNode.properties.content.guessMimetype(filename);
			}
			
			if (config.doExtractMetadata) {
				UploadUtils.extractMetadata(updatedNode);
			}
			
			// end
			
			
			function renameFile(fileName) {
				
				fileName = Utils.asString(fileName);
				var 
					replyFileName = Utils.asString(updatedNode.properties['cm:name']),
					newReplyFileName = fileName
				;
				
				if (replyFileName == fileName) return;
				
				if (!config.fullRename) {
					
					// try to update extension if necessary regarding the provided filename
					var 
						replyExtension = getFileExtension(replyFileName),
						newReplyExtension = getFileExtension(fileName)
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