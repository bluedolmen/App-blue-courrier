///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	// PRIVATE
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName(),
		documentNode = null,
		fileData = null,
		fileName = null,
		attachmentNode = null,
		copyRepositoryAttachment = true
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
				{ name : 'nodeRef', mandatory : true },
				'attachmentRef',
				'filedata', 
				'filename',
				'operation'
			),
			documentNodeRef = Utils.wrapString(parseArgs['nodeRef']),
			attachmentNodeRef = Utils.wrapString(parseArgs['attachmentRef'])
		;
		
		documentNode = search.findNode(documentNodeRef);
		
		if (!documentNode) {
			throw {
				code : 404,
				message : 'IllegalStateException! The provided nodeRef does not exist in the repository'
			};
		}
		
		if (!DocumentUtils.isOriginalDocumentNode(documentNode)) {
			throw {
				code : 403,
				message : 'Forbidden! Attachments are only allowed on original nodes, not copies'
			};			
		}
		
		if (!AttachmentUtils.canAttach(documentNode)) {
			throw {
				code : 403,
				message : 'Forbidden! You are not allowed to modify this document'
			};						
		}
		
		fileName = Utils.asString(parseArgs['filename']);  // overriding file-name
		
		if (null != parseArgs['filedata']) {
			fileData = parseArgs['filedata'];
			if (!fileData.content) {
				throw {
					code : 400,
					message : 'IllegalStateException! The provided filedata does is not a file-data field object as expected'
				};
			}
				
			fileName = fileName || Utils.asString(fileData.filename);
			fileData = fileData.content; // extract content from file-data field
		}
		else if (null != attachmentNodeRef) {
			attachmentNode = search.findNode(attachmentNodeRef);
			copyRepositoryAttachment = "move" !== Utils.asString(parseArgs['operation']);
		}
		else {
			throw {
				code : 400,
				message : 'IllegalArgumentException! Either the file-data of the attachement nodeRef has be provided'
			};
		}
		
		main();
		
	});
	
	function main() {
		
		if (null == attachmentNode) {
			createUploadedAttachment();
		}
		else {
			copyAttachmentIfNecessary();
		}
		
		attachDocument();
		
		addHistoryEvent();
		setModel();
		
	}
	
	function createUploadedAttachment() {
		
		var 
			attachmentsContainer = AttachmentUtils.getAttachmentsContainer(documentNode, /* createIfNotExists */ true)
		; 
		
		attachmentNode = UploadUtils.getContainerChildByName(
			attachmentsContainer, /* container */  
			fileName /* childName */,
			{} /* createConfig */ //Important! null means 'do not create'
		);
		
		attachmentNode.properties.content.write(fileData);
		UploadUtils.updateMimetype(attachmentNode, fileName);
		UploadUtils.extractMetadata(attachmentNode);
		
	}
	
	function copyAttachmentIfNecessary() {
		
		var 
			attachmentsContainer
		; 
		
		if (copyRepositoryAttachment) {
			attachmentsContainer = AttachmentUtils.getAttachmentsContainer(documentNode, /* createIfNotExists */ true);
			attachmentNode = attachmentNode.copy(attachmentsContainer);
		}
		
		if (Utils.asString(attachmentNode.name) != fileName) {
			attachmentNode.name = fileName;
			attachmentNode.save();
		}
		
	}
		
	function attachDocument() {
		
		return AttachmentUtils.addAttachment(
			documentNode, /* document */
			attachmentNode
		);
		
	}
	
	function addHistoryEvent() {
		
		if (null == attachmentNode) return;
		
		var
			attachmentNodeName = attachmentNode.name,
			comment = msg.get('add-attachment', [attachmentNodeName])
		;
		
		HistoryUtils.addHistoryEvent(
			documentNode,
			'attachment!add', /* eventType */
			comment
		);
		
		
	}
	
	function setModel() {
		model.attachmentNodeRef = Utils.asString(attachmentNode.nodeRef);
	}
	
	
})();