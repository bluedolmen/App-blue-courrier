var YammaUtils = {
	
	getSiteNode : function(document) {
		if (!document || !document.getSiteShortName) return null;
		var siteShortName = document.getSiteShortName();
		
		var site = siteService.getSite(siteShortName);
		if (!site) return null; // non-existing or non-accessible
		
		return site.getNode();		
	},
	
	getAdminSite : function() {
		
		var query = '+TYPE:"st\:site" +' + 
			Utils.getLuceneAttributeFilter('cm:name', YammaModel.ADMIN_SITE_NAME);
			
		var siteNodes = search.luceneSearch(query);
		return Utils.unwrapList(siteNodes);
		
	},
	
	isAdminSite : function(siteNode) {
		
		if (!siteNode || !siteNode.typeShort || 'st:site' != siteNode.typeShort) return false;
		
		var siteName = siteNode.name;
		if (!siteName) return false;
		
		return (YammaModel.ADMIN_SITE_NAME == siteName);
	},		
	
	isDocumentContainer : function(node) {
		return node && ('undefined' != typeof node.isSubType) && node.isSubType(YammaModel.DOCUMENT_CONTAINER_SHORTNAME);
	},
	
	/**
	 * Returns the container of a document or itself if already the container.
	 *  
	 * @param {ScriptNode} document the document or the container
	 * @return {ScriptNode} a document-container
	 */
	getDocumentContainer : function(document) {
		
		if (!document) return null;
		if (this.isDocumentContainer(document)) return document;
		
		// Try with parent
		var parent = document.parent;
		if (this.isDocumentContainer(parent)) return parent;
		
		// Try with source-association
		var source = document.sourceAssocs[YammaModel.DOCUMENT_CONTAINER_REFERENCE_ASSOCNAME][0];
		if (this.isDocumentContainer(source)) return source;
		
		// Invalid Document node structure, log a message
		logger.warn("Cannot get the container of the document '" + document.name + "' with nodeRef '" + document.nodeRef + "'.");
		return null;
	},
	
	getDocumentState : function(document) {
		if (!document) return YammaModel.DOCUMENT_STATE_UNKNOWN;
		
		
	}
	
	
};
