var TraysUtils = {
	
	TRAYS_LOCATION_SITE_PATH : 'documentLibrary',
	
	TRAYS_CONTAINER_TYPE : 'cm:folder',
	TRAYS_FOLDER_NAME : 'trays',
	TRAYS_FOLDER_TITLE : 'Bannettes',
	
	TRAY_CONTAINER_TYPE : 'yamma-ee:Tray',
	INBOX_TRAY_NAME : 'inbox',
	INBOX_TRAY_TITLE : 'Arrivée',
	OUTBOX_TRAY_NAME : 'outbox',
	OUTBOX_TRAY_TITLE : 'Départ',

	getTray : function(document) {
		
		var iterator = document.parent;
		while (iterator) {
			var typeShort = iterator.typeShort;
			if (this.TRAYS_CONTAINER_TYPE == typeShort) return iterator;			
		}
	
		return null;
	},
	
	getTraysParent : function(siteNode) {
		if (!siteNode) return null;
		
		if ('st:site' != siteNode.typeShort) {
			throw new Error('IllegalArgumentException! The siteNode is not of expected type st:site');
		}
		
		return siteNode.childByNamePath(this.TRAYS_LOCATION_SITE_PATH);
	},
	
	getSiteTraysNode : function(siteNode) {
		
		var traysParentNode = this.getTraysParent(siteNode);
		if (!traysParentNode) return null;
		
		return traysParentNode.childByNamePath(this.TRAYS_FOLDER_NAME);
	},
	
	getSiteTray : function(siteNode, trayName) {
		
		var traysNode = this.getSiteTraysNode(siteNode);
		if (!traysNode) return null;
		
		return traysNode.childByNamePath(trayName);
	},
	
	getSiteTraysChildren : function(siteNode) {
		
		var traysNode = this.getSiteTraysNode(siteNode);
		if (!traysNode) return [];
		
		return traysNode.childrenByXPath("*[subtypeOf('" + this.TRAY_CONTAINER_TYPE + "')]") || [];
		
	},
	
	/**
	 * Create site trays in a given site.
	 * <p>
	 * Also adapt the existing structure if one (partially) exists.
	 * 
	 * @param {The site-node} siteNode
	 */
	createSiteTrays : function(siteNode) {
		
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
				logger.warn("Cannot find the '" + me.TRAYS_LOCATION_SITE_PATH + "' directory in site '" + siteName + "'. Cannot create trays.");
				return null;
			}
			
			return traysParentNode.createNode(me.TRAYS_FOLDER_NAME, me.TRAYS_CONTAINER_TYPE, {'cm:title' : me.TRAYS_FOLDER_TITLE});
		}
		
		function createTrays(traysNode) {
			if (!traysNode) return;			
			createNonExistingChildNode(traysNode, me.INBOX_TRAY_NAME, me.INBOX_TRAY_TITLE);
			createNonExistingChildNode(traysNode, me.OUTBOX_TRAY_NAME, me.OUTBOX_TRAY_TITLE);
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
	}
	
};
