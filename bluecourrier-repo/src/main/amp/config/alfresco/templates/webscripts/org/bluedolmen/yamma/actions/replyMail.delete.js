///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/requestutils.lib.js">

(function() {
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		replyNode = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		replyNode = getRequestNode();
		
		if (!replyNode) {
			throw {
				code : 404,
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!ReplyUtils.canDelete(replyNode, fullyAuthenticatedUserName)) {
			throw {
				code : 401,
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
		
		main();
		
	});
	
	function main() {
		
		ReplyUtils.removeReply(replyNode);
		status.setCode(status.STATUS_NO_CONTENT, 'Pas de contenu');
		
	}
	
	
})();