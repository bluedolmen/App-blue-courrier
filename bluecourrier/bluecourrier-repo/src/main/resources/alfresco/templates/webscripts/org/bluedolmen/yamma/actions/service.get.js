///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var
		userName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		serviceName = null,
		serviceNode = null,
		parentServiceNode = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs({ name : 'service', mandatory : true});
		serviceName = parseArgs['service'];
		
		if (!ServicesUtils.isService(serviceName)) {
			throw {
				code : 500,
				message : "IllegalStateException! The provided service '" + serviceName + "' is not a managed service"
			};
		}
		serviceNode = Utils.Alfresco.getSiteNode(serviceName);

		main();
	});
	
	function main() {
		
		parentServiceNode = ServicesUtils.getParentServiceNode(serviceNode);
		setModel();
		
	}
	
	function getServiceManagers() {
		
		var
			serviceManagerNodes = ServicesUtils.getServiceRoleMembers(serviceNode, ServicesUtils.SERVICE_MANAGER_ROLENAME)
		;
		
		return Utils.map(serviceManagerNodes, function(serviceManagerNode) {
			if (null == serviceManagerNode) return '';
			return {
				displayName : Utils.Alfresco.getPersonDisplayName(serviceManagerNode),
				userName : serviceManagerNode.properties.userName
			}
		});
		
	}
	
	function getServiceDescription(serviceNode) {
		return ({
			displayName : serviceNode ? serviceNode.properties['cm:title'] || serviceNode.name : '',
			name : serviceNode ? serviceNode.name : ''
		});
	}
	
	function setModel() {
		
		model.serviceDescription = {
			
			isRootService : ServicesUtils.isRootService(serviceNode),
			
			parentService : getServiceDescription(parentServiceNode),
			
			isSigningService : ServicesUtils.isSigningService(serviceNode), 
			
			roles : {
				
				isManager : ServicesUtils.isServiceManager(serviceNode, userName),
				isAssistant : ServicesUtils.isServiceAssistant(serviceNode, userName),
				isInstructor : ServicesUtils.isServiceInstructor(serviceNode, userName)
				
			},
			
			serviceManagers : getServiceManagers()
			
		}
		
	}
	
})();