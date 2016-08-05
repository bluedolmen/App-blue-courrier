///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
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
				code : 404,
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!AttachmentUtils.canDelete(attachmentNode, fullyAuthenticatedUserName)) {
			throw {
				code : 403,
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};			
		}
		
		main();
		
	});
	
	function main() {
		
		addHistoryEvent(attachmentNode);
		
		AttachmentUtils.deleteAttachment(attachmentNode);
		status.setCode(status.STATUS_NO_CONTENT, 'Pas de contenu');
		
	}
	
	function addHistoryEvent(attachmentNode) {
		
		if (null == attachmentNode) return;
		
		var
			documentNode = AttachmentUtils.getAttachingDocument(attachmentNode), 
			attachmentNodeName = attachmentNode.name,
			comment = msg.get('delete-attachment', [attachmentNodeName])
		;
		
		if (null == documentNode) return;
		
		HistoryUtils.addHistoryEvent(
			documentNode,
			'attachment!delete', /* eventType */
			comment
		);
		
		
	}
	
	
	
})();