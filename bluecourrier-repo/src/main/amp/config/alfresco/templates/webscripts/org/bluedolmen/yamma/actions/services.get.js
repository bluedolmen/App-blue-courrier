///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:alfresco/templates/webscripts/org/bluedolmen/yamma/actions/services.lib.js">

(function() {

	var 
		serviceName = null,
		depth = 1,
		parentService = 'root',
		showMembership = false,
		nodes = []
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('serviceName', 'depth', 'membership');
		serviceName = Utils.wrapString(parseArgs['serviceName']);
		showMembership = 'true' === Utils.asString(parseArgs['membership']);

		// Children management
		doGetChildren = -1 != url.service.indexOf('children');
		if (doGetChildren) {
			parentService = serviceName || 'root';
		}
		depth = Number(parseArgs['depth']) || 1;
		depth = (-1 == depth) ? Number.MAX_VALUE : depth;
		rformat = doGetChildren ? 'tree' : 'list';
		
		main();
	});
	
	function main() {
		
		if (serviceName && serviceName != parentService) {
			// get unique service description
			
			var 
				service = ServicesUtils.getCheckedService(serviceName),
				serviceNode = service.node
			;
			nodes = [Yamma.ServicesTreeHelper.getNodeDescr(serviceNode, nodeDecorator)];
			
		}
		else {
			
			nodes = Yamma.ServicesTreeHelper.getTreeNodes(parentService, depth, nodeDecorator);
			if ('list' == rformat) {
				flattenTree();
			}
			
		}
		
		setModel();
		
	}
	
	function nodeDecorator(wrappedNode) {
		membershipNodeDecorator(wrappedNode);
		signableNodeDecorator(wrappedNode);
		inboxTrayNodeDecorator(wrappedNode);
	}
	
	function membershipNodeDecorator(wrappedNode) {
		
		if (!showMembership) return;
		
		var 
			userName = Utils.Alfresco.getFullyAuthenticatedUserName(),
			membership = ServicesUtils.getServiceRoles(wrappedNode.name, userName)
		;
		
		wrappedNode.membership = membership; 
		
	}
	
	function signableNodeDecorator(wrappedNode) {
		
		wrappedNode.isSignable = ServicesUtils.isSignable(wrappedNode.name);
		
	}
	
	function inboxTrayNodeDecorator(wrappedNode) {
		
		var inboxTray = TraysUtils.getInboxTray(wrappedNode.name);
		if (null == inboxTray) return;
		wrappedNode.inboxTray = Utils.asString(inboxTray.nodeRef);
		
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

		flattenTreeInternal(nodes);
		nodes = result;
	}
	
	function setModel() {
		
		model.rformat = rformat;
		model.items = nodes;
		
	}
	
})();