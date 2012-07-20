///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	// PRIVATE
	var fullyAuthenticatedUserName = Utils.getFullyAuthenticatedUserName();
	
	var documentNode;

	var fileData;
	var fileName;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}, {name : 'filedata', mandatory : true}, 'filename');
		var documentNodeRef = parseArgs['nodeRef'];
		documentNode = search.findNode(documentNodeRef);
		
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			}
		}
		
		if (!ActionUtils.canReply(documentNode, fullyAuthenticatedUserName)) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			}			
		}
		
		fileData = parseArgs['filedata'];
		if (!fileData.content) {
			throw {
				code : '412',
				message : 'IllegalStateException! The provided filedata does is not a file-data field object as expected'
			}
		}
			
		fileName = parseArgs['filename'] || fileData.filename; // overriding file-name
		fileData = fileData.content; // extract content from file-data field
		
		main();
	});
	
	function main() {
		
		var replyNode = attachReply();
		setModel(replyNode);
		
	}
		
	function attachReply() {
		
		return ReplyUtils.addReply(
			documentNode, /* document */ 
			fileData, /* replyContent */
			YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME, /* replyType */ 
			fileName /* replyName */
		)
		
	}	
	
	function setModel(replyNode) {
		model.replyNodeRef = Utils.asString(replyNode.nodeRef);
	}
	
	
})();