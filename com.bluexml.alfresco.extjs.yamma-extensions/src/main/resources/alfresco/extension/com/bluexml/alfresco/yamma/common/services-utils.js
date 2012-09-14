(function() {
	
	ServicesUtils = {
		
		getDelegatedServices : function(site) {
			
			if (!site) return [];
			
			var siteNode = site.node || site;
			if (!siteNode.hasAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME)) return [];
			
			return siteNode.assocs[YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME] || [];
			
		}
			
	};
	
})();