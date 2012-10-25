(function() {
	
	ServicesUtils = {
		
		getParentServices : function(site) {
			
			if (!site) return [];
			
			var siteNode = site.node || site;
			if (!siteNode.hasAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME)) return [];
			
			return siteNode.assocs[YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME] || [];
			
		},
		
		getParentService : function(site) {
			return ServicesUtils.getParentServices(site)[0];
		},
		
		setParentService : function(childSite, parentSite, overrideExisting) {
			
			overrideExisting = (true === overrideExisting);
			
			var 
				childSiteNode = getSiteNode(childSite),
				parentSiteNode = getSiteNode(parentSite)
			;
			
			if (!chidlSiteNode || !parentSiteNode) {
				throw new Error('IllegalArgumentException! One of the child or parent site is not valid and does not refer to a valid site');
			}
			
			if (!childSiteNode.hasAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME)) {
				childSiteNode.addAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME);
			}
			var parentService = ServicesUtils.getParentService(childSiteNode);
			if (parentService) {
				if (!overrideExisting) {
					throw new Error('IllegalStateException! The parent service is already defined. Use the \'overrideExisting\" parameter if this is what you meant.');
				}
				// remove existing parent service
				childSiteNode.removeAssociation(parentService, YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME);
			}
			
			childSiteNode.addAssociation(parentSite, YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME);
			
			return childSiteNode;
			
			function getSiteNode(site) {
				var siteNode = site.node || site;
				if ('string' == typeof site) {
					site = siteService.getSite(site);
					siteNode = site ? site.node : null;
				}

				if (!siteNode) return null;
				
				return siteNode;
			}
		}
			
	};
	
})();