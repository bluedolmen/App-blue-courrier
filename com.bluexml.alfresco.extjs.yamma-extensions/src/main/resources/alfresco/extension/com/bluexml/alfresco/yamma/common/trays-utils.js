var TraysUtils = {
	
	TRAYS_LOCATION_SITE_PATH : 'documentLibrary',
	
	TRAYS_CONTAINER_TYPE : 'cm:folder',
	TRAYS_FOLDER_NAME : 'trays',
	
	TRAY_CONTAINER_TYPE : 'cm:folder',
	INBOX_TRAY_NAME : 'inbox',
	OUTBOX_TRAY_NAME : 'outbox',

	getTray : function(document) {
		var iterator = document.parent;
		while (iterator) {
			var name = iterator.name;
			if (!name) continue;
			if (name.indexOf(this.TRAYS_FOLDER_NAME) > -1) return iterator;
			
			iterator = iterator.parent;
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
		
		return traysNode.childAssocs['cm:contains'] || [];		
	},
	
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
			
			return traysParentNode.createNode(me.TRAYS_FOLDER_NAME, me.TRAYS_CONTAINER_TYPE);
		}
		
		function createTrays(traysNode) {
			if (!traysNode) return;
			
			if (!isChildNodeExisting(traysNode, me.INBOX_TRAY_NAME) )
				traysNode.createNode(me.INBOX_TRAY_NAME, me.TRAY_CONTAINER_TYPE);
				
			if (!isChildNodeExisting(traysNode, me.OUTBOX_TRAY_NAME) )
				traysNode.createNode(me.OUTBOX_TRAY_NAME, me.TRAY_CONTAINER_TYPE);			
		}
		
		function isChildNodeExisting(parent, childName) {
			return parent.childByNamePath(childName);
		}
	}
	
};
