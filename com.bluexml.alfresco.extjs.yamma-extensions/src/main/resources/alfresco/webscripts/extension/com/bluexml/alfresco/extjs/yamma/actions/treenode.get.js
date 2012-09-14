///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	// PRIVATE
	var treeNode = null;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('node');
		treeNode = getTreeNode(parseArgs);
		
		main();
	});
	
	function getTreeNode(parseArgs) {
		var treeNodeRef = parseArgs['node'];
		
		if (treeNodeRef && 'root' !== treeNodeRef)
			return Common.getExistingNode(treeNodeRef);	
	}
	
	function main() {
		
		var children = getChildren();
		setModel(children);
		
	}
	
	function getChildren() {
		if (!treeNode) { // root-node => get sites
			return sortByTitle(getServicesNodes());
		}
		
		var treeNodeType = Utils.asString(treeNode.typeShort);
		switch (treeNodeType) {
			
			case 'st:site':
				var siteTrays = getSiteTraysChildren();
				var siteVirtualTrays = getSiteVirtualTraysChildren();
				
				return sortByTitle(siteTrays).concat(siteVirtualTrays);
			break;
			
		}
		
		return sortByTitle(getAllChildren());
	}
	
	/**
	 * Get the services nodes.
	 * 
	 * Services are structured by sites.
	 */
	function getServicesNodes() {
		var sitesNode = companyhome.childByNamePath('Sites');
		if (!sitesNode) {
			throw new Error('IllegalStateException! The Sites folder cannot be found');
		}
		
		var sites = siteService.listSites('','');		
		var filteredSiteNodes = Utils.map(sites, function(site) {
			if (YammaUtils.isConfigSite(site.shortName) ) return; // ignore config site
			return site.node;
		});
		
		var countFunction = getSelectNodeDescendantNumberFunction(
			".//*[subtypeOf('" + YammaModel.TRAY_TYPE_SHORTNAME + "')]//*[subtypeOf('" + YammaModel.DOCUMENT_TYPE_SHORTNAME + "')]"
		);
		
		var hasChildren = function(node) {
			return (node.childrenByXPath(".//*[subtypeOf('" + YammaModel.TRAY_TYPE_SHORTNAME + "')]") || []).length > 0;
		};
		
		return Utils.map(filteredSiteNodes, function(siteNode) {
			
			return {
				type : siteNode.typeShort,
				name : siteNode.name,
				title : siteNode.properties.title,
				ref : Utils.asString(siteNode.nodeRef),
				hasChildren : hasChildren(siteNode) ,
				count : countFunction(siteNode)
			};
			
		});
		
	}

	
	function getSiteTraysChildren() {
		var trayNodes = TraysUtils.getSiteTraysChildren(treeNode);
				
		var countFunction = getSelectNodeDescendantNumberFunction(
				".//*[subtypeOf('" + YammaModel.DOCUMENT_TYPE_SHORTNAME + "')]"
		);
			
		return Utils.map(trayNodes, function(trayNode) {
			return {
				type : 'tray',
				name : trayNode.name || '',
				title : trayNode.properties.title,
				ref : Utils.asString(trayNode.nodeRef),
				hasChildren : false,
				count : countFunction(trayNode)
			};	
		});
	}
	
	function getSiteVirtualTraysChildren() {
				
		var parentName = Utils.asString(treeNode.name);
		
		function getStateTrayDefinition(stateName) {
			return ({
				type : 'state-tray',
				name : stateName,
				title : stateName,
				ref : parentName + '|' + stateName, // ref has to be unique globally on a tree 
				hasChildren : false
			});			
		}
		
		return Utils.map(YammaModel.DOCUMENT_STATES, function(stateName) {
			
			if (YammaModel.DOCUMENT_STATE_VALIDATING_DELIVERY == stateName) return; //ignore
			if (YammaModel.DOCUMENT_STATE_ARCHIVED == stateName) return;
			
			return getStateTrayDefinition(stateName);
		});
		
		
	}
	
	function getDocumentLibraryChildren() {
		var documentLibraryNode = treeNode.childByNamePath('documentLibrary');
		if (!documentLibraryNode) return [];
		
		return getChildrenDescription(documentLibraryNode.children);
	}
	
	function getSelectNodeDescendantNumberFunction(query) {
		
		if (!query)
			throw "IllegalStateException! The provided xpath-like expression cannot be undefined nor null";
		
		return function(rootNode) {
			if (!rootNode) return 0;
			var matchingNodes = rootNode.childrenByXPath(query) || [];
			
			return matchingNodes.length;			
		};	
		
	}
	
	function getAllChildren() {
		return getChildrenDescription(treeNode.children);
	}
	
	/**
	 * Get the node children description.
	 * 
	 * @param {ScriptNode[]} children the list of Alfresco node children
	 * @param {Object} overrideConfig the overriding config for each child
	 * @param {Function} countFunction
	 * 
	 * @return {Object[]} An array of child description
	 */
	function getChildrenDescription(children, overrideConfig, countFunction) {
		overrideConfig = overrideConfig || {};
		
		return Utils.map( children,
			function(child) {
				var 
					count = countFunction ? countFunction(child) : null,
					childDescription = getChildDescription(child)
				;
					
				if (null != count) {
					childDescription.count = count;
				}
				
				Utils.apply(childDescription, overrideConfig);
				
				return childDescription;
			}
		);		
	}
	
	function getChildDescription(child) {
		
		return {
			type : child.typeShort,
			title : child.properties.title || child.name,
			ref : '' + child.nodeRef,
			hasChildren : ('cm:content' != child.typeShort) && (child.children.length > 0)
		};
		
	}
	
	function setModel(childrenDescription) {
		
		var childrenCount = childrenDescription.length;
		model.totalChildren = childrenCount;
		model.startIndex = 1;
		model.itemCount = childrenCount;
		model.children = childrenDescription;
		
	}
	
	function sortByTitle(array) {
		
		array = array || [];
		return array.sort(function(a,b) {
			var aTitle = a.title || '';
			var bTitle = b.title || '';
			
			if (aTitle == bTitle) return 0;
			return aTitle < bTitle ? -1 : 1;
			
		});
		
	}

	
})();