///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">

(function() {

	var
		node = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}),
			nodeRef_ = Utils.asString(parseArgs['nodeRef'])
		;
		
		node = Utils.Alfresco.getExistingNode(nodeRef_, true /* failsSilently */);
		if (null == nodeRef_) {
			throw {
				code : 400,
				message : 'The nodeRef does not match any existing node or you do not have permission to read it'
			}
		}
		
		if (!node.hasPermission('Read')) {
			throw {
				code : 500,
				message : 'You do not have read access to the provided node'
			}
		}
		
		main();
		
	});
	
	function main() {
		
		setModel();
		
	}
	
	
	function setModel() {
		
		var permissions = node.getFullPermissions();
		
		model.permissions = ({
			
				inerhits : node.inheritsPermissions(),
				
				permissions : Utils.Array.map(permissions, function(permission) {
					return Utils.Alfresco.getPermissionFromString(permission);
				})
		
		});
			
		
	}
	
})();