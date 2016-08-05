(function() {
	
	TraysUtils = {
	
		TRAYS_RELATIVE_PATH : 'cm:documentLibrary/cm:trays',		
		TRAYS_FOLDER_NAME : 'Trays',
		
		INBOX_TRAY_NAME : 'inbox',
		OUTBOX_TRAY_NAME : 'outbox',
		CCBOX_TRAY_NAME :  'ccbox',
		
		TRAYS : {
			
			'cm:inbox' : {
				name : 'Inbox',
				kind : YammaModel.TRAY_KIND_INBOX,
				permissions : {
					'SiteManager' : 'SiteManager',
					'ServiceManager' : 'SiteCollaborator',
					'ServiceAssistant' : 'SiteCollaborator',
					'ServiceInstructor' : 'SiteContributor',
					'ServiceSupervisor' : 'SiteContributor'
				}
			},
			
			'cm:outbox' : {
				name : 'Outbox',
				kind : YammaModel.TRAY_KIND_OUTBOX,
				permissions : {
					'SiteManager' : 'SiteManager',
					'ServiceManager' : 'SiteCollaborator',
					'ServiceAssistant' : 'SiteCollaborator',
					'ServiceInstructor' : 'SiteContributor',
					'ServiceSupervisor' : 'SiteContributor'
				}				
			},
			
			'cm:ccbox' : {
				name : 'Copies',
				kind : YammaModel.TRAY_KIND_CCBOX,
				permissions : {
					'SiteManager' : 'SiteManager',
					'ServiceManager' : 'SiteCollaborator',
					'ServiceAssistant' : 'SiteCollaborator',
					'ServiceInstructor' : 'SiteConsumer',
					'ServiceSupervisor' : 'SiteContributor'
				}				
			}
			
		} // defined hereafter
	},	
	
	TraysUtils.getTrayKind = function(tray) {
		return tray.properties[YammaModel.TRAY_KIND_PROPNAME];
	},
	
	TraysUtils.isInboxTray = function(tray) {
		
		if (null == tray) return false;
		var trayKind = TraysUtils.getTrayKind(tray);
		return YammaModel.TRAY_KIND_INBOX == trayKind;
		
	};
	
	TraysUtils.isOutboxTray = function(tray) {
		
		if (null == tray) return false;
		var trayKind = TraysUtils.getTrayKind(tray);
		return YammaModel.TRAY_KIND_OUTBOX == trayKind;
		
	};
	
	TraysUtils.getEnclosingTray = function(document) {
		
		var
			iterator = document.parent,
			typeShort
		;
		
		while (null != iterator) {
			typeShort = iterator.typeShort;
			if (iterator.hasAspect(YammaModel.TRAY_ASPECT_SHORTNAME)) return iterator;
			iterator = iterator.parent;
		}
	
		return null;
		
	};
	
	TraysUtils.getSiblingTray = function(tray, trayKind) {
		
		var enclosingSiteShortName = Utils.Alfresco.getEnclosingSiteName(tray);
		return TraysUtils.getSiteTray(enclosingSiteShortName, trayKind);		
		
	};
	
	TraysUtils._getSiteTraysNode = function(site) {
		
		if (null == site) return null;
		
		var siteNode = Utils.Alfresco.getSiteNode(site);
		if (null == siteNode) return null;
		
		var matchingNodes = siteNode.childrenByXPath(this.TRAYS_RELATIVE_PATH) || [null];
		return matchingNodes[0];
		
	};
	
	TraysUtils.getInboxTray = function(site) {
		
		return TraysUtils.getSiteTray(site, YammaModel.TRAY_KIND_INBOX);
		
	};
	
	TraysUtils.getCCboxTray = function(site) {
		
		return TraysUtils.getSiteTray(site, YammaModel.TRAY_KIND_CCBOX);
		
	};
	
	TraysUtils.getSiteTrays = function(site) {
		
		var traysNode = this._getSiteTraysNode(site);
		if (null == traysNode) return [];
		
		return traysNode.childrenByXPath("*[hasAspect('" + YammaModel.TRAY_ASPECT_SHORTNAME + "')]") || [];
		
	};
	
	TraysUtils.getSiteTray = function(site, trayKind) {
		
		var traysNode = this._getSiteTraysNode(site);
		if (null == traysNode) return null;
		
		var matchingChildren = traysNode.childrenByXPath('*[@' + YammaModel.TRAY_KIND_PROPNAME + '="' + trayKind + '"]') || [null];
		return matchingChildren[0];
		
	};
	
	/**
	 * Create site trays in a given site.
	 * <p>
	 * Also adapt the existing structure if one (partially) exists.
	 * 
	 * @param {The site-node} siteNode
	 */
	TraysUtils.createSiteTrays = function(site) {
		
		if (null == site) return;
		
		var 
			me = this,
			siteNode = Utils.Alfresco.getSiteNode(site),
			siteName = siteNode.name,
			traysNode = this._getSiteTraysNode(siteNode)
		;
		
		if (null == traysNode) { // create traysNode
			traysNode = createTraysNode(siteNode);
		}
		
		createTrays();
		
		
		function createTraysNode(siteNode) {
			
			var 
				siteObject = siteService.getSite(siteName),
				documentLibrary = siteObject.getContainer('documentLibrary')
			;
			
			// This is kind of specific due to the chosen path... => should be improved !
			if (null == documentLibrary) {
				siteObject.createContainer('documentLibrary');
			}
			
			traysNode = Utils.Alfresco.createPath(siteNode, TraysUtils.TRAYS_RELATIVE_PATH );
			if (null == traysNode) {
				throw new Error('IllegalStateException! Cannot create the trays folder');
			}
			
			var 
				msgKey = 'yamma.trays.traysfolder.name',
				traysFolderName = messages.get(msgKey) || TraysUtils.TRAYS_FOLDER_NAME
			;
			
			if (traysFolderName != traysNode.properties['cm:name']) {
				traysNode.properties['cm:name'] = traysFolderName;
				traysNode.save();				
			}
			
			if (!traysNode.hasAspect('sys:undeletable')) {
				traysNode.addAspect('sys:undeletable');
			}
			
			return traysNode;
			
		}
		
		function createTrays() {
			
			for (var trayPrefixedName in me.TRAYS) {
				createNonExistingTray(trayPrefixedName);
			}
			
		}
		
		function createNonExistingTray(trayPrefixedName) {
			
			var
				trayDefinition = TraysUtils.TRAYS[trayPrefixedName],
				msgKey = 'yamma.trays.' 
					+ trayPrefixedName.substring(trayPrefixedName.indexOf(':') + 1) 
					+ '.name',
				trayName = messages.get(msgKey) || trayDefinition.name,
				trayKind = trayDefinition.kind,
				trayNode = (traysNode.childrenByXPath(trayPrefixedName)||[null])[0] 
			;
			
			if (null == trayNode) {
				trayNode = traysNode.createNode(trayName, 'cm:folder', null, 'cm:contains', trayPrefixedName);
			}
			
			if (null == trayNode) {
				throw new Error("IllegalStateException! Cannot create the tray folder '" + trayPrefixedName + "'");				
			}
			
			if (!trayNode.hasAspect(YammaModel.TRAY_ASPECT_SHORTNAME)) {
				trayNode.addAspect(YammaModel.TRAY_ASPECT_SHORTNAME);
			}
			
			if (!trayNode.hasAspect('sys:undeletable')) {
				trayNode.addAspect('sys:undeletable');
			}
			
			trayNode.properties[YammaModel.TRAY_KIND_PROPNAME] = trayKind;
			trayNode.save();
			
			setTrayPermissions(trayNode, trayDefinition.permissions);
			
			return trayNode;
			
		}
		
		function setTrayPermissions(trayNode, permissions) {
			
			var
				roleName = null,
				serviceRoleGroupName = null,
				permission = null
			;
			
			for (roleName in permissions) {
				
				serviceRoleGroupName = ServicesUtils.getSiteRoleGroupName(siteName, roleName);
				permission = permissions[roleName];
				trayNode.setPermission(permission, 'GROUP_' + serviceRoleGroupName);
				
			}
			
			trayNode.setInheritsPermissions(false);
			
		}
		
	};	

	
	TraysUtils.removeEmptyTrays = function(site) {
		
		if (null == site) return;
		
		var 
			me = this,
			siteNode = Utils.Alfresco.getSiteNode(site),
			traysNode = this._getSiteTraysNode(siteNode),
			trayPrefixedName
		;
		
		if (null == traysNode) {
			return;
		}
			
		for (trayPrefixedName in me.TRAYS) {
			removeEmptyTray(trayPrefixedName);
		}
		
		traysNode.removeAspect('sys:undeletable'); // remove the undeletable aspect anyway
		if (0 == traysNode.children.length) {
			traysNode.remove();
		}
		
		function removeEmptyTray(trayPrefixedName) {
			
			var 
				trayNode = (traysNode.childrenByXPath(trayPrefixedName)||[null])[0],
				trayChildren
			;			
			if (null == trayNode) return;
			
			trayNode.removeAspect(YammaModel.TRAY_ASPECT_SHORTNAME);
			trayNode.removeAspect('sys:undeletable');
			
			trayChildren = trayNode.children || [];
			if (trayChildren.length > 1) return;
			
			trayNode.remove();
			
		}
		
	};	
	
	
})();
