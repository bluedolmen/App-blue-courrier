///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	var 
		depth = 1,
		rformat = 'tree',
		parentService = 'root',
		treeNodes = []
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('parentService', 'depth', 'rformat');
		parentService = parseArgs['parentService'] || 'root';
		depth = Number(parseArgs['depth']) || 1;
		rformat = parseArgs['rformat'] || 'tree';
		
		main();
	});
	
	function main() {
		
		treeNodes = getTreeNodes();
		treeNodes = processNodesAsTree(treeNodes, depth - 1);
		if ('rformat' == 'list') {
			flattenTree();
		}
		setModel();
		
	}
	
	function getTreeNodes() {
		
		if ('root' == parentService) {
			return getRootSiteNodes();
		} else {
			return getChildrenSiteNodes(); 
		}		
			
	}
	
	function getRootSiteNodes() {
		
		var
			sites = siteService.listSites('','');
			rootServices = Utils.map(sites, function accept(site) {
				var 
					siteNode = site.node,
					parentSite = (siteNode.assocs[YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME] || [])[0]
				;
				
				if (null != parentSite) return; // skip
				else return siteNode;
			})
		;
		
		return rootServices;
		
	}
	
	function getChildrenSiteNodes(site) {
		
		var siteNode = site;
		
		if ('string' == typeof site) {
			var site = siteService.getSite(siteName);
			if (null == site) {
				throw {
					code : '412',
					message : "The provided parent site-name '" + siteName + "' does not match any existing site."
				}
			}
			
			siteNode = site.node;
		}
		
		var
			siteChildren = siteNode.sourceAssocs[YammaModel.HIERARCHICAL_SERVICE_PARENT_ASSOCNAME] || [] 
		;
		
		return siteChildren;
		
	}
	
	function wrapTreeNode(treeNode, hasChildren) {
		
		return {
			name : treeNode.name,
			title : treeNode.properties['cm:title'],
			nodeRef : Utils.asString(treeNode.nodeRef),
			hasChildren : hasChildren ? hasChildren(treeNode) : false
		};
		
	}
	
	/**
	 * Recursive mehod that build a tree and wrap nodes
	 */
	function processNodesAsTree(treeNodes, depth) {
		
		return Utils.map(treeNodes, function(treeNode) {
			
			var 
				wrappedNode = wrapTreeNode(treeNode),
				childrenSiteNodes = 'tree' == rformat ? getChildrenSiteNodes(treeNode) : []
			;
			wrappedNode.hasChildren = childrenSiteNodes.length > 0;
			
			if (depth > 0) {
				wrappedNode.children = processNodesAsTree(childrenSiteNodes, depth - 1 );
			}
			
			return wrappedNode;
			
		});		
		
	}
	
	function flattenTree() {
		
		var result = [];
		
		// walk the tree depth-first
		function flattenTreeInternal(treeNodes) {
						
			Utils.forEach(treeNodes, function(treeNode) {
				result.push(treeNode);
				var children = treeNode.children || [];
				flattenTreeInternal(children);
			});
			
		}

		flattenTreeInternal(treeNodes);
		treeNodes = result;
	}
	
	function setModel() {
		
		model.items = treeNodes;
		
	}
	
})();