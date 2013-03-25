///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

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
						wrappedNode = wrapTreeNode(treeNode),
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
			
			function wrapTreeNode(treeNode, hasChildren) {
				
				var wrappedTreeNode = {
					name : treeNode.name,
					title : treeNode.properties['cm:title'],
					nodeRef : Utils.asString(treeNode.nodeRef),
					hasChildren : hasChildren ? hasChildren(treeNode) : false
				};
				
				if (undefined !== nodeDecorator && Utils.isFunction(nodeDecorator)) {
					var decoratedNode = nodeDecorator(wrappedTreeNode);
					if (undefined !== decoratedNode)
						wrappedTreeNode = decoratedNode;
				}
				
				return wrappedTreeNode;
				
			}
			
		}
		
	}
	
	
})();