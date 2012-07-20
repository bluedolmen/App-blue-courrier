(function(){
	
	UploadUtils = {
		
		updateMimetype : function(node, filename) {
			
			if (null == node) return; // do nothing
			
			if (filename) 
				node.properties.content.guessMimetype(filename);
				
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
			
			if (!container) {
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
		}
		
	};
	
})();