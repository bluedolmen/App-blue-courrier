(function() {	

	PrivacyUtils = Utils.Object.create(DatalistUtils, {
			
		DEFAULTS : {
			restricted : false,
			discardExisting : false,
			assistantRole : 'SiteCollaborator',
			managerRole : 'SiteCollaborator',
			instructorRole : 'No',
			supervisorRole : 'SiteConsumer'
		},
		
		DATALIST_XPATH_LOCATION : '/app:company_home/st:sites/cm:' + YammaUtils.ConfigSite.name + '/cm:dataLists/cm:privacy-levels',
		PROPERTY_NAME : YammaModel.PRIVACY_PRIVACY_LEVEL_PROPNAME,
		
		updatePermissions : function(documentNode, level) {
		
			DocumentUtils.checkDocument(documentNode);
			
			var 
				documentContainer = DocumentUtils.getDocumentContainer(documentNode),
				serviceName = Utils.Alfresco.getEnclosingSiteName(documentNode),
				
				serviceAssistantGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME),
				serviceManagerGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME),
				serviceInstructorGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME),
				serviceSupervisorGroupName = ServicesUtils.getSiteRoleGroupName(serviceName, ServicesUtils.SERVICE_SUPERVISOR_ROLENAME),
				
				restricted = this.DEFAULTS.restricted,
				discardExisting = this.DEFAULTS.discardExisting,
				
				assistantRole = this.DEFAULTS.assistantRole,
				managerRole = this.DEFAULTS.managerRole,
				instructorRole = this.DEFAULTS.instructorRole,
				supervisorRole = this.DEFAULTS.supervisorRole,
				
				privacyNode, currentLevel
				
			;
			
			if (undefined === level) {
				
				level = this.getNodeCurrentValue(documentNode);
				
			}
			
			// retrieve the privacy through the association
			privacyNode = this.getItemNode(level);
			
			if (null != privacyNode) {
				
				restricted = true == privacyNode.properties[YammaModel.PRIVACY_LEVEL_RESTRICTED_PROPNAME];
				discardExisting = true == privacyNode.properties[YammaModel.PRIVACY_LEVEL_DISCARD_EXISTING_PROPNAME];
				assistantRole = privacyNode.properties[YammaModel.PRIVACY_LEVEL_ASSISTANT_ROLE_PROPNAME];
				managerRole = privacyNode.properties[YammaModel.PRIVACY_LEVEL_MANAGER_ROLE_PROPNAME];
				instructorRole = privacyNode.properties[YammaModel.PRIVACY_LEVEL_INSTRUCTOR_ROLE_PROPNAME];
				supervisorRole = privacyNode.properties[YammaModel.PRIVACY_LEVEL_SUPERVISOR_ROLE_PROPNAME];
				
			}
			
			
			discardExistingPermissions();
			documentContainer.setInheritsPermissions(!restricted);
			if (!restricted) return; // stop there if not restricted
			
			setPermission(assistantRole,  serviceAssistantGroupName);
			setPermission(managerRole,    serviceManagerGroupName);
			setPermission(instructorRole, serviceInstructorGroupName);
			setPermission(supervisorRole, serviceSupervisorGroupName);

			
			function discardExistingPermissions() {
				
				if (!discardExisting) return;
				
//				var servicesWithAccess = getServicesWithAccess();
				
				// permission definition is a String of type :
				// ALLOWED;GROUP_service_dircom_ServiceManager;Collaborator
				Utils.forEach(documentContainer.getDirectPermissions(), function(permission) {
					
					permission = Utils.Alfresco.getPermissionFromString(permission);
					
					if ('ALLOWED' != permission.accessStatus) return; // do not know what to do with a DENY permission
					var 
						match = permission.authority.match(new RegExp('GROUP_' + ServicesUtils.SERVICE_PREFIX + '_(.*)_Service.*')),
						serviceName = match ? match[1] : null
					; 
					if (!match) return;
					
//					if (Utils.Array.contains(servicesWithAccess, serviceName)) return;
					
					documentContainer.removePermission(permission.role, permission.authority);
					
				});
				
			}
			
//			/**
//			 * This is currently computed by observing the links to the node
//			 */
//			function getServicesWithAccess() {
//				
//				var links = documentContainer.sourceAssocs['cm:links'] || [];
//				return Utils.Array.map(links, function(link){
//					return Utils.Alfresco.getEnclosingSiteName(link);
//				});
//				
//			}
			
			function setPermission(role, groupName) {
				
				if (null == role) return;
				groupName = 'GROUP_' + groupName;
				
				if ('No' == role) {
					role = findAuthorityDirectRole(groupName);
					if (null == role) return;
					
					documentContainer.removePermission(role, groupName);
				}
				else {
					documentContainer.setPermission(role, groupName);
				}
				
			}
			
			function findAuthorityDirectRole(authorityName) {
				
				var permission = Utils.Array.first(documentContainer.getDirectPermissions(), function(permission) {
					permission = Utils.Alfresco.getPermissionFromString(permission);
					return 'ALLOWED' == permission.accessStatus && permission.authority == authorityName;
				});
				
				if (null == permission) return null;
				
				return Utils.Alfresco.getPermissionFromString(permission).role;
				
			}
			
		}
		
	});

})();
