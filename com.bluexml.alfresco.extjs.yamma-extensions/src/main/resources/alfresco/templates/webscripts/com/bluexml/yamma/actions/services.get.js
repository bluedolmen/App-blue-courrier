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
		depth = (-1 == depth) ? Number.MAX_VALUE : depth;
		rformat = parseArgs['rformat'] || 'tree';
		
		main();
	});
	
	function main() {
		
		treeNodes = getTreeNodes();
		treeNodes = processNodesAsTree(treeNodes, depth - 1);
		if ('list' == rformat) {
			flattenTree();
		}
		setModel();
		
	}
	
	function getTreeNodes() {
		
		if ('root' == parentService) {
			return getRootServicesNodes();
		} else {
			return ServicesUtils.getChildrenServicesNodes(parentService); 
		}		
			
	}
	
	function getRootServicesNodes() {
		
		var
			rootServices = ServicesUtils.getRootServices(),
			rootServicesNodes = Utils.map(rootServices, function(service) {
				return service.node;
			})
		;
			
		return rootServicesNodes;
		
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
				childrenSiteNodes = ('tree' == rformat) ? ServicesUtils.getChildrenServicesNodes(treeNode) : [],
				hasChildren = childrenSiteNodes.length > 0
			;
			wrappedNode.hasChildren = hasChildren;
			
			if ( hasChildren && depth > 0 ) {
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
		
		model.rformat = rformat;
		model.items = treeNodes;
		
	}
	
})();