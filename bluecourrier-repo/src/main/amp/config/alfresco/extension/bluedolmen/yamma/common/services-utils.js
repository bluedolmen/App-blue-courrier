(function() {
	
	var ADMINISTRATORS_GROUP = '${bluecourrier.administrators-group}';
	
	function _isChildGroup(parentGroup, childGroupName) {
		
		var members;
		
		parentGroup = Utils.isString(parentGroup) ? groups.getGroup(parentGroup) : parentGroup;
		if (null == parentGroup) return false;
		
		members = parentGroup.getChildGroups() || [];
		return Utils.Array.exists( members, function(authority) {
			return childGroupName == Utils.asString(authority.shortName); 
		});
		
	}
	
	// TODO: Should use the groups JS API instead
	function _checkGroupIsDirectMember(serviceName, parentRoleName, memberRoleName, memberServiceName) {
		
		if (null == memberServiceName) {
			memberServiceName = serviceName;
		}
		
		var 
			parentGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, parentRoleName),
			memberGroupName = ServicesUtils.getSiteRoleGroupName(memberServiceName, memberRoleName)
		;
		
		return _isChildGroup(parentGroupName, memberGroupName);
		
	};
	
	function _addAsDirectMember(serviceName, parentRoleName, memberRoleName, memberServiceName) {
		
		if (null == memberServiceName) {
			memberServiceName = serviceName;
		}
		
		if (_checkGroupIsDirectMember(serviceName, parentRoleName, memberRoleName, memberServiceName)) return; // already present
		
		var 
			parentGroup = ServicesUtils.getSiteRoleGroup(serviceName, parentRoleName),
			memberGroup = ServicesUtils.getSiteRoleGroup(memberServiceName, memberRoleName)
		;
		
		people.addAuthority(parentGroup, memberGroup);
		
	}
	
	function _removeAsDirectMember(serviceName, parentRoleName, memberRoleName, memberServiceName) {
		
		if (null == memberServiceName) {
			memberServiceName = serviceName;
		}
		
		if (!_checkGroupIsDirectMember(serviceName, parentRoleName, memberRoleName, memberServiceName)) return; // already present
		
		var 
			parentGroup = ServicesUtils.getSiteRoleGroup(serviceName, parentRoleName),
			memberGroup = ServicesUtils.getSiteRoleGroup(memberServiceName, memberRoleName)
		;
		
		people.removeAuthority(parentGroup, memberGroup);
		
	}
	
	ServicesUtils = {
			
		SERVICE_PREFIX : 'site', // If changed to something else, the code has to be made compliant (notably regarding _addAsDirectMember)
		
		SERVICE_MANAGER_ROLENAME : 'ServiceManager',
		SERVICE_INSTRUCTOR_ROLENAME : 'ServiceInstructor',
		SERVICE_ASSISTANT_ROLENAME : 'ServiceAssistant',
		SERVICE_SUPERVISOR_ROLENAME : 'ServiceSupervisor',
		
		isService : function(site) {
			
			if (null == site) return false;
			
			if ('string' == typeof site) {
				// use the yamma helper to be able to check even if the current user does not have a reading access to the site
				return yammaHelper.isService(site);
			}

			// The provided argument is a site-node or a site definition, fall back on the standard javascript checking
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (null == siteNode) return false;
			
			return siteNode.hasAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);
			
		},
		

		/**
		 * Get the site definition, ensuring that the site is a service.
		 * <p>
		 * Beware that it works only if the current authenticated user
		 * has a reading access to the site (so is member of the site)
		 */
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

		isSignable : function(site) {
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (null == siteNode) return false;
			
			return true === siteNode.properties[YammaModel.SERVICE_CAN_SIGN_PROPNAME];
			
		},
		
		setSignable : function(site, signable) {
			
			if (!ServicesUtils.isService(site)) {
				Utils.Error.raise("IllegalArgumentException! The site '" + site + "' is not defined as a service");
			}
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			
			siteNode.properties[YammaModel.SERVICE_CAN_SIGN_PROPNAME] = signable;
			siteNode.save();
			
		},
		
		setAsService : function(site, properties, forceReset) {
			
			properties = properties || {};
			
			if (null == site) {
				Utils.Error.raise('IllegalArgumentException! The provided site parameter is not valid.');
			}
			
			var 
				siteNode = Utils.Alfresco.getSiteNode(site),
				serviceName = siteNode.properties['cm:name'],
				canSign = (properties === 'true') || !!properties.canSign,
				parent = properties.parent
			;
			
			if (ServicesUtils.isService(siteNode)) {
				if (true !== forceReset) {
					return;
				}
				siteNode.removeAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);
			}
			
			addAdminsitratorsGroup();
			
			siteNode.addAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);
			
			if (null != parent) {
				ServicesUtils.setParentService(siteNode, parent, forceReset);
			}
			
			ServicesUtils.setSignable(site, canSign);
			createRoleGroupsIfNecessary();
			TraysUtils.createSiteTrays(site);
			
			return siteNode;
			
			function createRoleGroupsIfNecessary() {
				
				var
					serviceManager = ServicesUtils.createRoleGroup(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME),
					serviceAssistant = ServicesUtils.createRoleGroup(serviceName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME),
					serviceInstructor = ServicesUtils.createRoleGroup(serviceName, ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME),
					serviceSupervisor = ServicesUtils.createRoleGroup(serviceName, ServicesUtils.SERVICE_SUPERVISOR_ROLENAME)
				;
				
				_addAsDirectMember(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME, 'SiteManager');
				_addAsDirectMember(serviceName, 'SiteConsumer', ServicesUtils.SERVICE_SUPERVISOR_ROLENAME);
				_addAsDirectMember(serviceName, 'SiteContributor', ServicesUtils.SERVICE_ASSISTANT_ROLENAME);
				_addAsDirectMember(serviceName, 'SiteCollaborator', ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME);
				_addAsDirectMember(serviceName, ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME, ServicesUtils.SERVICE_MANAGER_ROLENAME);
				_addAsDirectMember(serviceName, ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME, ServicesUtils.SERVICE_ASSISTANT_ROLENAME);
				_addAsDirectMember(serviceName, ServicesUtils.SERVICE_SUPERVISOR_ROLENAME, ServicesUtils.SERVICE_MANAGER_ROLENAME);
				
			}
			
			function addAdminsitratorsGroup() {
				
				var 
					siteManagerGroupName = 'site_' + serviceName + '_' + 'SiteManager',
					siteManagerGroup = groups.getGroup(siteManagerGroupName)
				;
				
				if (null == siteManagerGroup) return;
				if ( _isChildGroup(siteManagerGroup, ADMINISTRATORS_GROUP) ) return; 
				
				siteManagerGroup.addAuthority('GROUP_' + ADMINISTRATORS_GROUP);
				
			}
						
		},
		
		unsetAsService : function(site) {
			
			if (null == site) {
				Utils.Error.raise('IllegalParameterException! The provided site parameter is not valid.');
			}
			
			var 
				siteNode = Utils.Alfresco.getSiteNode(site),
				serviceName = siteNode.properties['cm:name']
			;
			
			if (!ServicesUtils.isService(siteNode)) return;	

			TraysUtils.removeEmptyTrays(siteNode);
			removeRoleGroups();
			removeServiceHierarchy();
			siteNode.removeAspect(YammaModel.SERVICE_ASPECT_SHORTNAME);

			function removeServiceHierarchy() {
				// remove incoming service hierarchy association
				var
					parentServiceNode = (siteNode.assocs[YammaModel.SERVICE_PARENT_ASSOCNAME] || [])[0],
					childServiceNodes = siteNode.sourceAssocs[YammaModel.SERVICE_PARENT_ASSOCNAME] || []
				;
				Utils.forEach(childServiceNodes, function(serviceNode) {
					serviceNode.removeAssociation(siteNode, YammaModel.SERVICE_PARENT_ASSOCNAME);
					if (null == parentServiceNode) return;
					
					serviceNode.createAssociation(parentServiceNode, YammaModel.SERVICE_PARENT_ASSOCNAME);
				});				
			}
			
			function removeRoleGroups() {
				Utils.forEach(ServicesUtils.ROLES, function(roleName) {
					ServicesUtils.deleteRoleGroup(serviceName, roleName);
				});
			}
			
		},
		
		getSiteRoleGroupName : function(serviceName, roleName) {
			return ServicesUtils.SERVICE_PREFIX + '_' + serviceName + '_' + roleName;
		},
		
		getSiteRoleGroup : function(serviceName, roleName) {
			
			var
				siteRoleGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, roleName),
				siteRoleGroup = people.getGroup('GROUP_' + siteRoleGroupName)
			;
			
			return siteRoleGroup;
			
		},
		
		getGroupServiceAndRole : function(group, checked /* false */) {
			
			if (null == group) return null;
			
			if (!Utils.isString(group)) {
				group = group.properties['cm:authorityName'];
				if (null == group) return null;
			}
			
			var match = new RegExp('^(?:GROUP_)?' + ServicesUtils.SERVICE_PREFIX + '_([^_]*)_([^_]*)$').exec(group);
			if (null == match) return null;
			
			var
				serviceName = match[1],
				roleName = match[2]
			;
			
			if (
				true === checked && !( 
					ServicesUtils.isService(serviceName) && 
					Utils.Array.contains(Services.ROLES, roleName)
				)
			) return null;
			
			
			return {
				service : serviceName,
				role : roleName
			};
			
		},
		
		getGroupServiceName : function(group) {
			
			var serviceAndRole = ServicesUtils.getGroupServiceAndRole(group);
			if (null == serviceAndRole) return null;
			
			return serviceAndRole.service;
			
		},
		
		createRoleGroup : function(serviceName, roleName) {
			
			var siteRoleGroup = ServicesUtils.getSiteRoleGroup(serviceName, roleName);
			if (null != siteRoleGroup) return siteRoleGroup;
			
			var
				siteGroup, // site system-group
				siteRoleGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, roleName),
				roleDisplayName = Utils.Alfresco.getMessage('yamma.roles.' + roleName + '.label') + 's',
				serviceDisplayName = Utils.Alfresco.getSiteTitle(serviceName),
				displayName = Utils.Alfresco.getMessage('yamma.roles.group-display-name', [roleDisplayName, serviceDisplayName]),
				rootRoleGroup = getOrCreateRootRoleGroup(roleName),
				roleGroup
			;
			
			siteGroup = groups.getGroup(this.getServiceGroupName(serviceName));
			if (null == siteGroup) {
				throw new Error('IllegalArgumentException! The service \'' + serviceName + '\' does not exist, or you do not have access to it.')
			}
			
			roleGroup = groups.createRootGroup(siteRoleGroupName, displayName);
			
			siteGroup.addAuthority(roleGroup.fullName);
			rootRoleGroup.addAuthority(roleGroup.fullName);
			
			return roleGroup;
			
			function getOrCreateRootRoleGroup() {
				
				var rootRoleGroup = groups.getGroup(roleName);
				if (null == rootRoleGroup) {
					rootRoleGroup = groups.createRootGroup(roleName, roleDisplayName);
				}
				
				return rootRoleGroup;
				
			}
			
		},
		
		getServiceGroupName : function (serviceName) {
			
			return 'site_' + serviceName;
			
		},
		
		deleteRoleGroup : function(serviceName, roleName) {
			
			var siteRoleGroup = ServicesUtils.getSiteRoleGroup(serviceName, roleName);
			if (null == siteRoleGroup) return;
			
			people.deleteGroup(siteRoleGroup);
			
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
			
			var currentParentServiceNode = ServicesUtils.getParentServiceNode(childSiteNode);
			if (null != currentParentServiceNode) {
				
				if (null != parentSiteNode) {
					if (Utils.asString(currentParentServiceNode.name) == Utils.asString(parentSiteNode.name)) return; // same parent => end
				}
				
				if (!overrideExisting && null != parentSiteNode) {
					throw new Error('IllegalStateException! The parent service is already defined. Use the \'overrideExisting\" parameter if this is what you meant.');
				}
				
				ServicesUtils.unsetParentService(childService);
				
			}
			
			childSiteNode.createAssociation(parentSiteNode, YammaModel.SERVICE_PARENT_ASSOCNAME);
			
//			var 
//				serviceName = childSiteNode.name,
//				parentServiceName = parentSiteNode.name
//			;
//			
//			_addAsDirectMember(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME, ServicesUtils.SERVICE_MANAGER_ROLENAME, parentServiceName);
//			_addAsDirectMember(serviceName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME, ServicesUtils.SERVICE_ASSISTANT_ROLENAME, parentServiceName);
			
			return childSiteNode;
			
		},
		
		unsetParentService : function(childService, parentService) {
			
			var 
				childSiteNode = Utils.Alfresco.getSiteNode(childService),
				parentSiteNode
			;
				
			if (null == childSiteNode) {
				throw new Error('IllegalArgumentException! One of the child or parent site is not valid and does not refer to a valid site');
			}
			
			parentSiteNode = (null == parentService) ? ServicesUtils.getParentServiceNode(childSiteNode) : Utils.Alfresco.getSiteNode(parentService);
			if (null == parentSiteNode) return; // no parent
					
			childSiteNode.removeAssociation(parentSiteNode, YammaModel.SERVICE_PARENT_ASSOCNAME);
			
//			var 
//				serviceName = childSiteNode.name,
//				parentServiceName = parentSiteNode.name
//			;
//		
//			_removeAsDirectMember(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME, ServicesUtils.SERVICE_MANAGER_ROLENAME, parentServiceName);
//			_removeAsDirectMember(serviceName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME, ServicesUtils.SERVICE_ASSISTANT_ROLENAME, parentServiceName);
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
				siteRoleGroup = ServicesUtils.getSiteRoleGroup(service, role),
				members = siteRoleGroup ? people.getMembers(siteRoleGroup) : [] 
			;
			
			return Utils.Array.filter(members, function(personNode) { return !Utils.Alfresco.isPersonDisabled(personNode); });
				
		},
		
		
		setUserServiceRole : function(userName, serviceName, roleName) {
			
			var 
				person = people.getPerson(userName),
				siteGroup = ServicesUtils.createRoleGroup(serviceName, roleName)
			;
			
			if (null == person) {
				throw new Error("Cannot find any valid user with username '" + userName + "'");
			}
			
			siteGroup.addAuthority(person);
			
		},
		
		hasServiceRole : function(serviceName, userName, role) {
			
			return ServicesUtils._checkRole(serviceName, userName, role, role);
			
		},
		
		isServiceManager : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, ServicesUtils.SERVICE_MANAGER_ROLENAME);
			
		},
		
		isServiceInstructor : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME);
			
		},
		
		isServiceAssistant : function(serviceName, userName) {
			
			return ServicesUtils._checkRole(serviceName, userName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME);
			
		},
		
		getServiceRoles : function(serviceName, userName) {
			
			var
				checkedRoles = ServicesUtils.ROLES, 
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
					siteRoleGroupName = 'GROUP_' + ServicesUtils.SERVICE_PREFIX + '_' + serviceName + '_' + role,
					siteRoleGroup = people.getGroup(siteRoleGroupName)
				;
				if (null == siteRoleGroup) return false;
				
				var members = people.getMembers(siteRoleGroup);
				return Utils.contains(members, function match(v) {
					return userName == Utils.asString(v.properties.userName);
				} );
				
			});
			
			return Utils.unwrapList(result);
			
		}
			
	};

	ServicesUtils.ROLES = [
	    ServicesUtils.SERVICE_MANAGER_ROLENAME, 
	    ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME, 
	    ServicesUtils.SERVICE_ASSISTANT_ROLENAME, 
	    ServicesUtils.SERVICE_SUPERVISOR_ROLENAME
	];

})();