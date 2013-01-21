///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/copy-utils.js">

(function() {

	
	Yamma.Actions.ReplyMailAction = Utils.Object.create(Yamma.Actions.NodeAction, {

		fileData : null,
		fileName : null,
		modelNode : null,
		operation : 'copy',
		
		wsArguments : [
			'modelRef',
			'filedata', 
			'filename',
			{ name : 'operation', defaultValue : 'copy' }
		],
						
		prepare : function() {
			
			Yamma.Actions.NodeAction.prepare.call(this);
			
			var 
				modelRef = this.parseArgs['modelRef']
			;
			
			this.modelNode = modelRef ? this.extractNode(modelRef) : null;
			
			var fileData = this.parseArgs['filedata'];
			if (null != fileData) {
				if (null == fileData.content) {
					throw {
						code : '512',
						message : 'IllegalStateException! The provided filedata does is not a file-data field object as expected'
					};
				}
				this.fileData = fileData.content; // extract content from file-data field
			}
				
			this.fileName = this.parseArgs['filename'] || ( this.fileData ? this.fileData.filename : null ); // overriding file-name
			this.operation = this.parseArgs['operation'];
			
			if (null == fileData && null == modelRef) {
				throw {
					code : '512',
					message : 'IllegalStateException! Either filedata or modelRef should be provided to this service'
				};				
			}
			
		},		
		
		isExecutable : function(node) {
			
			return ActionUtils.canReply(this.node, this.fullyAuthenticatedUserName);
			
		},
		
		doExecute : function(node) {
			
			this.replyNode = this.attachReply();
			
		},
		
		attachReply : function() {
			
			var replyNode = null;
			
			this.repliesContainer = ReplyUtils.getRepliesContainer(this.node, /* createIfNotExists */ true);
			
			if (null == this.modelNode) {
				replyNode = this.attachUploadedContent();
			} else {
				replyNode = this.attachRepositoryFile();
			}
			
			return ReplyUtils.addReply(
				this.node, /* document */ 
				replyNode /* replyNode */
			);
			
		},
		
		attachUploadedContent : function() {
			
			var 
				replyNode = UploadUtils.getContainerChildByName(
					this.repliesContainer, /* container */  
					this.fileName, /* childName */ 
					{type : YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME} /* createConfig */
				)
			;
			
			replyNode.properties.content.write(this.fileData);
			UploadUtils.updateMimetype(replyNode, this.fileName);
			UploadUtils.extractMetadata(replyNode);

			return replyNode;
			
		},
		
		attachRepositoryFile : function() {
			
			var 
				newDocumentNode = this.modelNode,
				success = null
			;

			if ('move' == this.operation) {
				success = this.modelNode.move(this.repliesContainer);
				if (true === success) return;
				
				logger.warn(
					"Cannot move node '" + this.modelNode.nodeRef + "'" +
					" to desintation '" + this.repliesContainer.nodeRef + "'." +
					" Performs a copy instead."
				);
			}
			
			newDocumentNode = CopyUtils.copyToDestination(this.modelNode, this.repliesContainer, this.filename);
			newDocumentNode.specializeType(YammaModel.OUTBOUND_MAIL_TYPE_SHORTNAME);
			
			return newDocumentNode;
			
		},
		
		
		getNodeOutcome : function(node) {
			
			var
				nodeRef = Utils.asString(node.nodeRef),
				replyNodeRef = Utils.asString(this.replyNode.nodeRef)
			;
			
			return {
				nodeRef : nodeRef,
				replyNodeRef :  replyNodeRef
			};
			
		}		
		
		
	});

	
	
})();