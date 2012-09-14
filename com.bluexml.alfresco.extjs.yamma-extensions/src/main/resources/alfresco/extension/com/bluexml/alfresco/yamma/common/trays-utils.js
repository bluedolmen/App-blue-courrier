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
	},
	
	setTrayTitle(TraysUtils.INBOX_TRAY_NAME, 'Arrivée');
	setTrayTitle(TraysUtils.OUTBOX_TRAY_NAME, 'Départ');
	setTrayTitle(TraysUtils.CCBOX_TRAY_NAME, 'Copie');
	
	function setTrayTitle(trayName, trayTitle) {
		trayTitle = trayTitle || msg.get('tray.' + TraysUtils.INBOX_TRAY_NAME + '.title') || trayName;
		TraysUtils.TRAYS[trayName] = {
			title : trayTitle
		};
	}
	
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
				
		if (null == tray || null == tray.isSubType || !tray.isSubType(this.TRAY_CONTAINER_TYPE) || !trayName) return null;
		var trayParent = tray.parent;
		if (!trayParent || !trayParent.hasPermission('Read')) return null;
		
		return trayParent.childByNamePath(trayName);
		
	};
	
	TraysUtils.getTraysParent = function(site) {
		
		if (!site) return null;
		
		
		if ('string' == typeof site) {
			// Try to get the site from the potential site shortName
			site = siteService.getSite(site);
			if (!site) return null;			
		}
		
		var siteNode = site.node ? site.node : site;
		if (!siteNode) return null;
		
		if (!siteNode.isSubType('st:site')) {
			throw new Error('IllegalStateException! The site is not of expected type st:site');
		}
		
		return siteNode.childByNamePath(this.TRAYS_LOCATION_SITE_PATH);
	};
	
	TraysUtils.getSiteTraysNode = function(site) {
		
		var traysParentNode = this.getTraysParent(site);
		if (!traysParentNode) return null;
		
		return traysParentNode.childByNamePath(this.TRAYS_FOLDER_NAME);
	};
	
	TraysUtils.getSiteTray = function(site, trayName) {
		
		var traysNode = this.getSiteTraysNode(site);
		if (!traysNode) return null;
		
		return traysNode.childByNamePath(trayName);
	};
	
	TraysUtils.getSiteTraysChildren = function(site) {
		
		var traysNode = this.getSiteTraysNode(site);
		if (!traysNode) return [];
		
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
		
		if (!siteNode) return;
		
		var me = this;
		var siteName = siteNode.name;
		
		var traysNode = this.getSiteTraysNode(siteNode);
		if (!traysNode) { // create traysNode
			traysNode = createTraysNode(siteNode);
		}
		createTrays(traysNode);
		
		
		function createTraysNode(siteNode) {
			var traysParentNode = me.getTraysParent(siteNode);
			if (!traysParentNode) {
				logger.warn("Cannot find the '" + me.TRAYS_LOCATION_SITE_PATH + "' directory in site '" + siteName + "'. Creating folder '" + me.TRAYS_LOCATION_SITE_PATH + "'");
				traysParentNode = me.getTraysParent(siteNode);
				
				if (!traysParentNode) {
					logger.error("Cannot create the '" + me.TRAYS_LOCATION_SITE_PATH + "' directory in site '" + siteName + "'. Cannot create the trays folder.'");
					return null;
				}
			}
			
			return traysParentNode.createNode(me.TRAYS_FOLDER_NAME, me.TRAYS_CONTAINER_TYPE, {'cm:title' : me.TRAYS_FOLDER_TITLE});
		}
		
		function createPath(rootNode, path) {
			var 
				segments = rootNode.split('/'),
				currentNode = rootNode
			;	
				
			Utils.forEach(segments, function(segment) {
				var childNode = currentNode.childByNamePath(segment);
				if (!childNode) {
					childNode = currentNode.createFolder(segment);
				}
				currentNode = childNode;
			});
			
			return currentNode;
		}
		
		function createTrays(traysNode) {
			if (!traysNode) return;	
			for (trayName in me.TRAYS) {
				var trayTitle = me.TRAYS[trayName].title || trayName;
				createNonExistingChildNode(traysNode, trayName, trayTitle);
			}
		}
		
		function createNonExistingChildNode(parent, childName, childTitle) {
			var childTray = parent.childByNamePath(childName);
			if (!childTray) {
				childTray = parent.createNode(childName, me.TRAY_CONTAINER_TYPE, {'cm:title' : childTitle});
			}
			if (!childTray) return null;
			
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
