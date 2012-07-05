var YammaUtils = {
	
	getSite : function getSite(document) {
		var iterator = document.parent;
		while (iterator) {
			var typeShort = iterator.typeShort;
			if ('st:site' == typeShort) return iterator;
	
			iterator = iterator.parent;
		}
	
		return null;
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
	
	isMailDelivered : function(mailNode) {
		
		if (!this.isDocumentNode(mailNode))
			throw new Error('IllegalArgumentException! The provided node is not of the correct type');
		
		var enclosingSite = this.getSite(mailNode);
		if (!enclosingSite) return false;
		
		var enclosingSiteName = enclosingSite.name;
			
		var assignedService = this.getAssignedService(mailNode); 
		if (!assignedService) return false;		
		
		var assignedServiceName = assignedService.name;
		if (!assignedServiceName) return false;
		
		return Utils.asString(enclosingSiteName) == Utils.asString(assignedServiceName); // Stirng Object-s
	},
	
	getAssignedService : function(node) {
		if (!this.isDocumentNode(node))
			throw new Error('IllegalArgumentException! The provided node is not of the correct type');
		
		var assignedService = node.assocs[YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME];
		if (!assignedService || 0 == assignedService.length ) return null;
		
		var firstAssignedService = assignedService[0];
		return firstAssignedService;
	},
	
	getDistributedServices : function(node) {
		if (!this.isDocumentNode(node))
			throw new Error('IllegalArgumentException! The provided node is not of the correct type');
		
		return node.assocs[YammaModel.DISTRIBUTABLE_SERVICES_ASSOCNAME] || [];
	},
	
	isDocumentNode : function(node) {
		return node && ('undefined' != typeof node.isSubType) && node.isSubType(YammaModel.DOCUMENT_TYPE_SHORTNAME);
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
