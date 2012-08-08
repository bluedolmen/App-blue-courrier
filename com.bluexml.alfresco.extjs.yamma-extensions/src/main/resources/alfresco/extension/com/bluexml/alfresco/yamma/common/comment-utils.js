///<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/comments/comments.lib.js">
(function() {
	
	CommentUtils = {
				
		getComments : function(document) {
			
			if (!document || !DocumentUtils.isDocumentNode(document)) return [];
			
			/*
			 * Relies on the comment library imported from alfresco
			 */
			var comments = getComments(document);
			return comments;
			
		}
		
		
	};

})();
