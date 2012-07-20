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
	}	
	
	
};
