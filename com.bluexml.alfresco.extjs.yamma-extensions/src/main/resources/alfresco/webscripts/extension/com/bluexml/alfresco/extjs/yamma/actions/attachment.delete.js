///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:alfresco/templates/webscripts/org/alfresco/repository/requestutils.lib.js">

(function() {
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		attachmentNode = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		attachmentNode = getRequestNode();
		
		if (!attachmentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!AttachmentUtils.canDelete(attachmentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
		
		main();
	});
	
	function main() {
		
		AttachmentUtils.deleteAttachment(attachmentNode);
		status.setCode(status.STATUS_NO_CONTENT, 'Pas de contenu');
		
	}
	
	
})();