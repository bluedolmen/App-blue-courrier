///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	Utils.ns('Yamma');
	
	Yamma.ServicesTreeHelper = {
		
		getTreeNodes : function(parentService, depth, nodeDecorator) {
			
			depth = undefined === depth ? 1 : depth;
			
			var treeNodes = ('root' == parentService) ?
				getRootServicesNodes() :
				ServicesUtils.getChildrenServicesNodes(parentService)
			;
				
			treeNodes = processNodesAsTree(treeNodes, depth - 1);
			return treeNodes;
			// END

			
			// HELPER PRIVATE FUNCTIONS
			
			function getRootServicesNodes() {
				
				var
					rootServices = ServicesUtils.getRootServices(),
					rootServicesNodes = Utils.map(rootServices, function(service) {
						return service.node;
					})
				;
					
				return rootServicesNodes;
				
			}
				
			/**
			 * Recursive mehod that build a tree and wrap nodes
			 */
			function processNodesAsTree(treeNodes, depth) {
				
				return Utils.map(treeNodes, function(treeNode) {
					
					var 
						wrappedNode = Yamma.ServicesTreeHelper.getNodeDescr(treeNode, nodeDecorator),
						childrenSiteNodes = ServicesUtils.getChildrenServicesNodes(treeNode),
						hasChildren = childrenSiteNodes.length > 0
					;
					wrappedNode.hasChildren = hasChildren;
					
					if ( hasChildren && depth > 0 ) {
						wrappedNode.children = processNodesAsTree(childrenSiteNodes, depth - 1 );
					}
					
					return wrappedNode;
					
				});		
				
			}
			
			
		},
		
		getNodeDescr : function(treeNode, nodeDecorator, hasChildren) {
			
			var wrappedTreeNode = {
				name : treeNode.name,
				title : treeNode.properties['cm:title'],
				nodeRef : Utils.asString(treeNode.nodeRef)
			};
			
			if (Utils.isFunction(hasChildren)) {
				wrappedTreeNode.hasChildren = hasChildren(treeNode);
			}
			
			if (Utils.isFunction(nodeDecorator)) {
				var decoratedNode = nodeDecorator(wrappedTreeNode);
				if (undefined !== decoratedNode)
					wrappedTreeNode = decoratedNode;
			}
			
			return wrappedTreeNode;
			
		}
		
	}
	
	
})();