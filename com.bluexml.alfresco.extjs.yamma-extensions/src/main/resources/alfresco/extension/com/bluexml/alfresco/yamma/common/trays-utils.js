(function() {
	
	TraysUtils = {
	
		TRAYS_LOCATION_SITE_PATH : 'documentLibrary',
		
		TRAYS_CONTAINER_TYPE : 'cm:folder',
		TRAYS_FOLDER_NAME : 'trays',
		TRAYS_FOLDER_TITLE : 'Bannettes',
		
		TRAY_CONTAINER_TYPE : YammaModel.TRAY_TYPE_SHORTNAME,
		// TODO: Should define I18N mechanism
		INBOX_TRAY_NAME : 'inbox',
		OUTBOX_TRAY_NAME : 'outbox',
		CCBOX_TRAY_NAME :  'ccbox',
		TRAYS : {} // defined hereafter
		
	}
	
	TraysUtils.TRAYS[TraysUtils.INBOX_TRAY_NAME] = {
		name : TraysUtils.INBOX_TRAY_NAME,
		type : 'system-tray'
	}
	
	TraysUtils.TRAYS[TraysUtils.CCBOX_TRAY_NAME] = {
		name : TraysUtils.CCBOX_TRAY_NAME,
		type : 'system-tray'
	}
	
	Utils.forEach(YammaModel.DOCUMENT_STATES, function(stateName) {
		TraysUtils.TRAYS[stateName] = {
			name : stateName,
			type : 'state-tray'
		}
	});
	
	TraysUtils.getSystemTrayDefinitions = function() {
		// TODO: Implement this
	}
	
	TraysUtils.isInboxTray = function(tray) {
		
		if (!tray) return false;
		return TraysUtils.INBOX_TRAY_NAME == tray.name;
		
	};
	
	TraysUtils.isOutboxTray = function(tray) {
		
		if (!tray) return false;
		return TraysUtils.OUTBOX_TRAY_NAME == tray.name;
		
	};
	
	TraysUtils.getEnclosingTray = function(document) {
		
		var iterator = document.parent;
		while (iterator) {
			var typeShort = iterator.typeShort;
			if ( (this.TRAY_CONTAINER_TYPE == typeShort) && this.TRAYS[iterator.name])  return iterator;
			iterator = iterator.parent;
		}
	
		return null;
	};
	
	TraysUtils.getSiblingTray = function(tray, trayName) {
				
		if (null == tray || !trayName) return null;
		if (undefined === tray.typeShort || this.TRAY_CONTAINER_TYPE != tray.typeShort) return null;
		var trayParent = tray.parent;
		if (null == trayParent || !trayParent.hasPermission('Read')) return null;
		
		return trayParent.childByNamePath(trayName);
		
	};
	
	TraysUtils.getTraysParent = function(site) {
		
		if (null == site) return null;
		
		var siteNode = Utils.Alfresco.getSiteNode(site);
		if (null == siteNode) return null;		
		
		return siteNode.childByNamePath(this.TRAYS_LOCATION_SITE_PATH);
	};
	
	TraysUtils.getSiteTraysNode = function(site) {
		
		var traysParentNode = this.getTraysParent(site);
		if (null == traysParentNode) return null;
		
		return traysParentNode.childByNamePath(this.TRAYS_FOLDER_NAME);
	};
	
	TraysUtils.getSiteTray = function(site, trayName) {
		
		var traysNode = this.getSiteTraysNode(site);
		if (null == traysNode) return null;
		
		return traysNode.childByNamePath(trayName);
	};
	
	TraysUtils.getSiteTraysChildren = function(site) {
		
		var traysNode = this.getSiteTraysNode(site);
		if (null == traysNode) return [];
		
		return traysNode.childrenByXPath("*[subtypeOf('" + this.TRAY_CONTAINER_TYPE + "')]") || [];
		
	};
	
	/**
	 * Create site trays in a given site.
	 * <p>
	 * Also adapt the existing structure if one (partially) exists.
	 * 
	 * @param {The site-node} siteNode
	 */
	TraysUtils.createSiteTrays = function(siteNode) {
		
		if (null == siteNode) return;
		
		var 
			me = this,
			siteName = siteNode.name,
			traysNode = this.getSiteTraysNode(siteNode)
		;
		
		if (null == traysNode) { // create traysNode
			traysNode = createTraysNode(siteNode);
		}
		createTrays(traysNode);
		
		
		function createTraysNode(siteNode) {
			var traysParentNode = me.getTraysParent(siteNode);
			if (null == traysParentNode) {
				logger.warn("Cannot find the '" + me.TRAYS_LOCATION_SITE_PATH + "' directory in site '" + siteName + "'. Creating folder '" + me.TRAYS_LOCATION_SITE_PATH + "'");
				traysParentNode = me.getTraysParent(siteNode);
				
				if (null == traysParentNode) {
					logger.error("Cannot create the '" + me.TRAYS_LOCATION_SITE_PATH + "' directory in site '" + siteName + "'. Cannot create the trays folder.'");
					return null;
				}
			}
			
			return traysParentNode.createNode(me.TRAYS_FOLDER_NAME, me.TRAYS_CONTAINER_TYPE, {'cm:title' : me.TRAYS_FOLDER_TITLE});
		}
		
		function createTrays(traysNode) {
			if (null == traysNode) return;	
			for (var trayName in me.TRAYS) {
				var trayTitle = me.TRAYS[trayName].title || trayName;
				createNonExistingChildNode(traysNode, trayName, trayTitle);
			}
		}
		
		function createNonExistingChildNode(parent, childName, childTitle) {
			var childTray = parent.childByNamePath(childName);
			if (null == childTray) {
				childTray = parent.createNode(childName, me.TRAY_CONTAINER_TYPE, {'cm:title' : childTitle});
				if (null == childTray) return null;
			}
			
			// Check title
			var title = childTray.properties['cm:title'];
			if (!title || childTitle != title) {
				childTray.properties['cm:title'] = childTitle;
				childTray.save();
			}
			
			// Check container-type
			if (me.TRAY_CONTAINER_TYPE == childTray.typeShort) return childTray;
			var isSpecializedCorrectly = childTray.specializeType(me.TRAY_CONTAINER_TYPE);
			if (!isSpecializedCorrectly) return null;
			
			return childTray;
		}
	};	

	
})();
