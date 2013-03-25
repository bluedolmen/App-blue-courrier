(function() {
	
	ServicesUtils = {
		
		isService : function(site) {
			
			if (null == site) return false;			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (null == siteNode) return false;
			
			return siteNode.hasAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);
			
		},
		
		getCheckedService : function(site) {
			
			if (!ServicesUtils.isService(site)) return null;			
			var 
				siteNode = Utils.Alfresco.getSiteNode(site),
				siteName = siteNode.name
			;
			
			return siteService.getSite(siteName);
			
		},
		
		/**
		 * Beware.
		 * This method will return the correct list of sites if the context user
		 * has the right to see all the sites (mainly admin users)
		 * 
		 * @param {} site
		 * @return {}
		 */
		getManagedServices : function() {
			
			var
				sites = siteService.listSites(null,null),
				managedServices = Utils.filter(sites, function(site) {
					return ServicesUtils.isService(site); 
				})
			;
			
			return managedServices;
			
		},
		
		setAsService : function(site, properties, forceReset) {
			
			properties = properties || {};
			
			if (null == site) {
				Utils.Error.raise('IllegalParameterException! The provided site parameter is not valid.');
			}
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (ServicesUtils.isService(siteNode)) {
				if (true !== forceReset) {
					return;
				}
				siteNode.removeAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);
			}
			
			siteNode.addAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);
			
			var canSign = (properties === 'true') || !!properties.canSign;
			siteNode.properties[YammaModel.SERVICE_CAN_SIGN_PROPNAME] = canSign;
			siteNode.save();
			
			var parent = properties.parent;
			if (null != parent) {
				ServicesUtils.setParentService(siteNode, parent, forceReset);
			}
			
			return siteNode;
			
		},
		
		isSigningService : function(site) {
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (!ServicesUtils.isService(siteNode)) return false;
			
			var canSign = siteNode.properties[YammaModel.SERVICE_CAN_SIGN_PROPNAME] || false;
			return canSign;
			
		},
		
		getRootServices : function() {
		
			var
				managedServices = ServicesUtils.getManagedServices(),
				rootServices = Utils.filter(managedServices,
					function accept(service) {
						return ServicesUtils.isRootService(service);
					}
				)
			;
				
			return rootServices;
			
		},
		
		getParentServiceNodes : function(site) {
			
			if (null == site) return [];
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			return siteNode.assocs[YammaModel.SERVICE_PARENT_ASSOCNAME] || [];
			
		},
		
		getParentServiceNode : function(site) {
			return ServicesUtils.getParentServiceNodes(site)[0];
		},
		
		isRootService : function(site) {
			return null == ServicesUtils.getParentServiceNode(site);
		},		
		
		setParentService : function(childService, parentService, overrideExisting) {
			
			overrideExisting = (true === overrideExisting);
			
			var 
				childSiteNode = Utils.Alfresco.getSiteNode(childService),
				parentSiteNode = Utils.Alfresco.getSiteNode(parentService)
			;
			
			if (null == childSiteNode || null == parentSiteNode) {
				throw new Error('IllegalArgumentException! One of the child or parent site is not valid and does not refer to a valid site');
			}
			
			ServicesUtils.setAsService(childSiteNode); // if not already set
			ServicesUtils.setAsService(parentSiteNode);
			
			var currentParentService = ServicesUtils.getParentServiceNode(childSiteNode);
			if (null != currentParentService) {
				if (!overrideExisting) {
					throw new Error('IllegalStateException! The parent service is already defined. Use the \'overrideExisting\" parameter if this is what you meant.');
				}
				if (Utils.asString(currentParentService.shortName) != Utils.asString(parentSiteNode.name)) {
					// remove existing parent service
					childSiteNode.removeAssociation(currentParentService.node, YammaModel.SERVICE_PARENT_ASSOCNAME);
					childSiteNode.createAssociation(parentSiteNode, YammaModel.SERVICE_PARENT_ASSOCNAME);
				}
			} else {
				childSiteNode.createAssociation(parentSiteNode, YammaModel.SERVICE_PARENT_ASSOCNAME);
			}
			
			return childSiteNode;
			
		},
		
		getChildrenServicesNodes : function(site) {
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			
			return (siteNode.sourceAssocs[YammaModel.SERVICE_PARENT_ASSOCNAME] || []);
			
		},
		
		getChildrenServices : function(site) {
			
			var siteChildrenNodes = ServicesUtils.getChildrenServicesNodes();
			return Utils.map(siteChildrenNodes, function(siteNode) {
				var siteName = siteNode.name;
				if (!siteName) return; // ignore
				
				return siteService.getSite(siteName);
			}); 
			
		},
		
		
		getServiceRoleMembers : function(service, role) {
			
			var 
				serviceName = Utils.asString(service.shortName || service.name || service),
				siteRoleGroupName = 'GROUP_site_' + serviceName + '_' + role,
				siteRoleGroup = people.getGroup(siteRoleGroupName),
				members = siteRoleGroup ? people.getMembers(siteRoleGroup) : [] 
			;
			
			return members;
			
		},
		
		hasServiceRole : function(serviceName, userName, role) {
			
			return ServicesUtils._checkRole(serviceName, userName, role, role);
			
		},
		
		isServiceManager : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, 'ServiceManager');
			
		},
		
		isServiceInstructor : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, 'ServiceInstructor');
			
		},
		
		isServiceAssistant : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, 'ServiceAssistant');
			
		},
		
		getServiceRoles : function(serviceName, userName) {
			
			var
				checkedRoles = ['ServiceManager', 'ServiceInstructor', 'ServiceAssistant'], 
				result = ServicesUtils._checkRole(serviceName, userName, checkedRoles)
			;
						
			var resultMap = {}, role, i, len;
			for (i = 0, len = checkedRoles.length; i < len; i++) {
				role = checkedRoles[i]; 
				resultMap[role] = result[i];
			}
			return resultMap;
			
		},
		
		/**
		 * @private
		 */
		_checkRole : function(serviceName, userName, roles) {
			
			userName = Utils.asString(userName);
			
			if (Utils.Alfresco.isScriptNode(serviceName)) {
				serviceName = serviceName.name;
			}
			
			var serviceSite = siteService.getSite(serviceName);
			if (null == serviceSite) return false;

			roles = Utils.wrapAsList(roles);
			
			var result = Utils.map(roles, function(role) {
				
				var memberRole = Utils.asString(serviceSite.getMembersRole(userName));
				if (memberRole == role) return true;
				
				var 
					siteRoleGroupName = 'GROUP_site_' + serviceName + '_' + role,
					siteRoleGroup = people.getGroup(siteRoleGroupName)
				;
				if (null == siteRoleGroup) return false;
				
				var members = people.getMembers(siteRoleGroup);
				return Utils.contains(members, userName,
					function equals(it, refValue) {
						return refValue == Utils.asString(it.properties.userName); 
					}
				);
				
			});
			
			return Utils.unwrapList(result);
			
		}
			
	};
	
})();