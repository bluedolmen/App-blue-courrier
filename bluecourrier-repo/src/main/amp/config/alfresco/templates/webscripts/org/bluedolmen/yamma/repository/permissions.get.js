///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var
		node = null,
		includeDisplayNames
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}, "includeDisplayNames"),
			nodeRef_ = Utils.asString(parseArgs['nodeRef'])
		;
		
		node = Utils.Alfresco.getExistingNode(nodeRef_, true /* failsSilently */);
		if (null == nodeRef_) {
			throw {
				code : 400,
				message : 'The nodeRef does not match any existing node or you do not have permission to read it'
			};
		}
		
		if (!node.hasPermission('Read')) {
			throw {
				code : 500,
				message : 'You do not have read access to the provided node'
			};
		}
		
		includeDisplayNames = 'true' === Utils.asString(parseArgs['includeDisplayNames']);
		
		main();
		
	});
	
	function main() {
		
		var 
		
			permissions = Utils.Array.map(node.getFullPermissions(), function(permission) {
				return Utils.Alfresco.getPermissionFromString(permission);
			}),
			
			servicePermissions = {},
			
			userPermissions = {},
			
			otherPermissions = {}
			
		;
		
		Utils.Array.forEach(permissions, function(permission) {
			
			var serviceAndRole, key, authority;
			
			if ('ALLOWED' != permission.accessStatus) {
				logger.warn('Do not know how to process a DENY permission on node ' + node.nodeRef);
				return;
			}
			
			if (!Utils.String.startsWith(permission.authority, 'GROUP_')) {
				// supposed as user
				key = permission.authority;
				if (includeDisplayNames) {
					authority = Utils.Alfresco.getPersonDisplayName(key);
					if (null != authority) {
						key += '|' + authority;
					}
				}
				
				userPermissions[key] = permission.role;
				return;
			}
			
			serviceAndRole = ServicesUtils.getGroupServiceAndRole(permission.authority);
			if (null == serviceAndRole) {
				key = permission.authority;
				if (includeDisplayNames) {
					authority = people.getGroup(key);
					if (null != authority) {
						key += '|' + authority.properties['cm:authorityDisplayName'];
					}
				}
				
				otherPermissions[key] = permission.role;
				return;
			}
			
			key = serviceAndRole.service;
			if (includeDisplayNames) {
				authority = Utils.Alfresco.getSiteNode(key);
				if (null != authority) {
					key += '|' + authority.properties['cm:title'];
				}
			}
			
			if (undefined === servicePermissions[key]) {
				servicePermissions[key] = {};
			}
			
			servicePermissions[key][serviceAndRole.role] = permission.role;
			
		});
		
		model.permissions = ({
			
				services : servicePermissions,
				
				users : userPermissions,
				
				others : otherPermissions
		
		});
		
	}
	
})();