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
			
		},
		
		hasServiceRole : function(serviceName, userName, role) {
			
			return ServicesUtils._checkRole(serviceName, userName, role, role);
			
		},
		
		isServiceManager : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, 'ServiceManager', 'ServiceManager');
			
		},
		
		isServiceInstructor : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, 'ServiceInstructor', 'ServiceInstructor');
			
		},
		
		isServiceAssistant : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, 'ServiceAssistant', 'ServiceAssistant');
			
		},
		
		/**
		 * @private
		 */
		_checkRole : function(serviceName, userName, primaryRole, additionalRole) {
			
			userName = Utils.asString(userName);
			
			var serviceSite = siteService.getSite(serviceName);
			if (!serviceSite) return false;
			
			var memberRole = Utils.asString(serviceSite.getMembersRole(userName));
			if (memberRole) {
				return (memberRole == primaryRole);
			}
			
			var 
				siteRoleGroupName = 'GROUP_site_' + serviceName + '_' + additionalRole,
				siteRoleGroup = people.getGroup(siteRoleGroupName)
			;
			if (null == siteRoleGroup) return false;
			
			var 
				members = people.getMembers(siteRoleGroup)
			;
			
			return Utils.contains(members, 
				function equals(a,b) {
					return userName == Utils.asString(member.properties['cm:userName']); 
				}
			);
			
		}
			
	};
	
})();