///<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/comments/comments.lib.js">
(function() {
	
	CommentUtils = {
				
		getComments : function(documentNode) {
			
			if (!DocumentUtils.isDocumentNode(documentNode)) return [];
			
			/*
			 * Relies on the comment library imported from alfresco
			 */
			var comments = getComments(documentNode);
			return comments;
			
		},
		
		addComment : function(documentNode, config) {
			
			var 
				title = '',
				content = '',
				mimetype = 'text/html',
				author = null
			;
			
			if ('string' == typeof config) {
				content = config;
			}
			else {
				config = config || {};
				title = config.title || title;
				content = config.content || content;
				mimetype = config.mimetype || mimetype;
				author = config.owner || config.author || null;
			}			
			
			var 
				commentsFolder = getOrCreateCommentsFolder(documentNode), // fetch the parent to add the node to
				name = Utils.Alfresco.getUniqueChildName(commentsFolder, "comment"), // get a unique name
				commentNode = commentsFolder.createNode(name, "fm:post") // create the comment			
			;
			
			commentNode.mimetype = mimetype;
			commentNode.properties.title = title;
			commentNode.content = content;
			commentNode.save();

			if (null != author) {
				commentNode.setOwner(author);
			}
			
			return commentNode;
			
		}	
		
	};

})();
