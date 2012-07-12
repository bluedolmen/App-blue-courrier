///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	// PRIVATE
	var treeNode;
	
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
		var sortedChildren = sortByTitle(children);
		
		setModel(sortedChildren);
		
	}
	
	function getChildren() {
		var children = null;
		if (!treeNode) { // root-node => get sites
			return getSiteNodes();
		}
		
		var treeNodeType = Utils.asString(treeNode.typeShort);
		switch (treeNodeType) {
			
			case 'st:site':
				return getSiteTraysChildren();
			break;
			
		}
		
		return getAllChildren();
	}
	
	function getSiteNodes() {
		var sitesNode = companyhome.childByNamePath('Sites');
		if (!sitesNode) {
			throw new Error('IllegalStateException! The Sites folder cannot be found');
		}
		
		var filteredSiteNodes = Utils.filter(sitesNode.children, function(siteNode) {
			return !YammaUtils.isAdminSite(siteNode);
		});
		return getChildrenDescription(
			filteredSiteNodes,
			{},
			getSelectNodeDescendantNumberFunction(
				".//*[subtypeOf('" + YammaModel.TRAY_TYPE_SHORTNAME + "')]//*[subtypeOf('" + YammaModel.DOCUMENT_TYPE_SHORTNAME + "')]"
			)			
		);
	}
	
	function getSiteTraysChildren() {
		var trayNodes = TraysUtils.getSiteTraysChildren(treeNode);
				
		return getChildrenDescription(trayNodes, 
			{
				type : 'tray',
				hasChildren : false
			},
			getSelectNodeDescendantNumberFunction(
				".//*[subtypeOf('" + YammaModel.DOCUMENT_TYPE_SHORTNAME + "')]"
			)			
		);
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
		}		
		
	}
	
	function getAllChildren() {
		return getChildrenDescription(treeNode.children);
	}
	
	function getChildrenDescription(children, overrideConfig, countFunction) {
		overrideConfig = overrideConfig || {};
		
		return Utils.map( children,
			function(child) {
				var count = countFunction ? countFunction(child) : null;
				if (null != count) {
					overrideConfig.count = count;
				}
				return getChildDescription(child, overrideConfig);
			}
		);		
	}
	
	function getChildDescription(child, config) {
		
		config = 'undefined' == typeof config ? {} : config;
		
		var childDescription = {
			type : child.typeShort,
			title : child.properties.title || child.name,
			ref : '' + child.nodeRef,
			hasChildren : ('cm:content' != child.typeShort) && (child.children.length > 0)
		}
		
		if ('undefined' != typeof config) {
			Utils.apply(childDescription, config);
		}
		
		return childDescription;
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