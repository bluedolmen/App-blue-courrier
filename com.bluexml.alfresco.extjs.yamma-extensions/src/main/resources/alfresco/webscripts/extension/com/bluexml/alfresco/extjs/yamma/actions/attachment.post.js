///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		documentNode = null,
		fileData = null,
		fileName = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs({ name : 'nodeRef', mandatory : true}, {name : 'filedata', mandatory : true}, 'filename');
		var documentNodeRef = parseArgs['nodeRef'];
		documentNode = search.findNode(documentNodeRef);
		
		if (!documentNode) {
			throw {
				code : '512',
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (
				DocumentUtils.isDocumentNode(documentNode) && !ActionUtils.canAttach(documentNode, fullyAuthenticatedUserName) ||
				ReplyUtils.isReplyNode(documentNode) && !ReplyUtils.canAttach(documentNode, fullyAuthenticatedUserName)
		) {
			throw {
				code : '403',
				message : 'Forbidden! The action cannot be executed by you in the current context'
			};						
		}
		
		fileData = parseArgs['filedata'];
		if (!fileData.content) {
			throw {
				code : '412',
				message : 'IllegalStateException! The provided filedata does is not a file-data field object as expected'
			};
		}
			
		fileName = parseArgs['filename'] || fileData.filename; // overriding file-name
		fileData = fileData.content; // extract content from file-data field
		
		main();
	});
	
	function main() {
		
		var attachmentNode = attachDocument();
		setModel(attachmentNode);
		
	}
		
	function attachDocument() {
		
		var 
			attachmentsContainer = AttachmentUtils.getAttachmentsContainer(documentNode, /* createIfNotExists */ true),
			attachmentNode = UploadUtils.getContainerChildByName(
				attachmentsContainer, /* container */  
				fileName /* childName */,
				{} /* createConfig */ //Important! null means 'do not create'
			)
		; 
		
		attachmentNode.properties.content.write(fileData);
		UploadUtils.updateMimetype(attachmentNode, fileName);
		UploadUtils.extractMetadata(attachmentNode);		
		
		return AttachmentUtils.addAttachment(
			documentNode, /* document */
			attachmentNode
		);
		
	}	
	
	function setModel(attachmentNode) {
		model.attachmentNodeRef = Utils.asString(attachmentNode.nodeRef);
	}
	
	
})();