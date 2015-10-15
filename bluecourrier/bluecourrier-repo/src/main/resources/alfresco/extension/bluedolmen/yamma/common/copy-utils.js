
(function() {
	
	CopyUtils = {
		
		copyToDestination : function(node, destination, filename) {
			
			var 
				copiedNode = node.copy(destination),
				currentFileName = node.properties['cm:name']
			;
			if (null == copiedNode) {
				throw {
					code : 500,
					message : 'IllegalStateException! The node cannot be copied for some (unknown) reason'
				};
			}
			
			if (filename && filename != currentFileName) {
				copiedNode.properties['cm:name'] = filename;
				copiedNode.save();
			}
			
			return copiedNode;
			
		}
		
	};

})();
