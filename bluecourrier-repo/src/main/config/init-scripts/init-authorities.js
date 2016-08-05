///<import resource="classpath:${config.target.path}/init-scripts/init-common.js">

(function() {

	var InitAuthorities = Utils.Object.create(Init.InitDefinition, {
		
		id : 'bluecourrier-authorities',
		
		ADMINISTRATORS_GROUP : '${bluecourrier.administrators-group}',
		ADMINISTRATORS_DISPLAY_NAME : 'Administrateurs de BlueCourrier',
		CONFIG_SITE : '${bluecourrier.config-sitename}',
		CONFIG_SITEMANAGER_GROUP : 'site_${bluecourrier.config-sitename}_SiteManager',
		
		init : function() {
		
			this.createGroups();
			this.configureAdminGroup();
			
		},
		
		clear : function() {

			this.clearGroups();
			
		},
		
		checkInstalled : function() {

			var
				adminGroup = this.getOrCreateGroup(this.ADMINISTRATORS_GROUP, false)
			;
			
			if (null == adminGroup) return Init.InstallationStates.NO;
			
			if (!this.isMember(this.CONFIG_SITEMANAGER_GROUP, this.ADMINISTRATORS_GROUP)) return Init.InstallationStates.PARTIALLY;
			
			return Init.InstallationStates.FULL;
			
		},
		
		isMember : function(parentGroup, childGroup) {
			
			var members, childGroupName;
			
			parentGroup = getGroup(parentGroup);
			childGroup = getGroup(childGroup);
			if (null == parentGroup || null == childGroup) return false;
			
			childGroupName = Utils.asString(childGroup.shortName);
			
			members = parentGroup.getChildGroups();
			return Utils.contains(members, function match(g) {
				return childGroupName == Utils.asString(g.shortName);
			} );
			
			function getGroup(group) {
				return Utils.isString(group) ? groups.getGroup(group) : group;
			}
			
		},
		
		getDetails : function() {

			return 'No details available';
			
		},
		
		createGroups : function() {
			
			this.getOrCreateGroup(this.ADMINISTRATORS_GROUP, true, this.ADMINISTRATORS_DISPLAY_NAME);
			
		},
		
		getOrCreateGroup : function(groupName, createIfNotExists /* boolean */, displayName) {
			
			var group = groups.getGroup(groupName);
			if (null == group) {
				if (false === createIfNotExists) return null; 
				group = groups.createRootGroup(groupName, displayName || groupName);
			}
			
			return group;
			
		},
		
		clearGroups : function() {
			
			var adminsGroup = this.getOrCreateGroup(this.ADMINISTRATORS_GROUP, false);
			if (null != adminsGroup) {
				adminsGroup.deleteGroup();
			}
			
		},
		
		configureAdminGroup : function() {
			
			var
				me = this
			;
			
			if (!this.isMember(this.CONFIG_SITEMANAGER_GROUP, this.ADMINISTRATORS_GROUP)) {
				addAsSiteManager();
			}
			
			function addAsSiteManager() {
				
				// The admin-group is a site-administrator of the BlueCourrier site
				var configSiteManagerGroup = groups.getGroup(me.CONFIG_SITEMANAGER_GROUP);
				if (null == configSiteManagerGroup) return;
				
				configSiteManagerGroup.addAuthority('GROUP_' + me.ADMINISTRATORS_GROUP);
				
			}
			
		}
		
	});
	
	init.definition = InitAuthorities;

})();