(function() {
	
	ServicesUtils = {
				
		getParentServices : function(site) {
			
			if (null == site) return [];
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (!siteNode.hasAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME)) return [];
			
			return siteNode.assocs[YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME] || [];
			
		},
		
		getParentService : function(site) {
			return ServicesUtils.getParentServices(site)[0];
		},
		
		setParentService : function(childSite, parentSite, overrideExisting) {
			
			overrideExisting = (true === overrideExisting);
			
			var 
				childSiteNode = Utils.Alfresco.getSiteNode(childSite),
				parentSiteNode = Utils.Alfresco.getSiteNode(parentSite)
			;
			
			if (null == childSiteNode || null == parentSiteNode) {
				throw new Error('IllegalArgumentException! One of the child or parent site is not valid and does not refer to a valid site');
			}
			
			if (!childSiteNode.hasAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME)) {
				childSiteNode.addAspect(YammaModel.HIERARCHICAL_SERVICE_ASPECT_SHORTNAME);
			}
			var parentService = ServicesUtils.getParentService(childSiteNode);
			if (null != parentService) {
				if (!overrideExisting) {
					throw new Error('IllegalStateException! The parent service is already defined. Use the \'overrideExisting\" parameter if this is what you meant.');
				}
				// remove existing parent service
				childSiteNode.removeAssociation(parentService, YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME);
			}
			
			childSiteNode.addAssociation(parentSite, YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME);
			
			return childSiteNode;
			
		}
			
	};
	
})();