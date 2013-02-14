///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/copy-utils.js">

(function() {

	
	Yamma.Actions.ReplyMailAction = Utils.Object.create(Yamma.Actions.NodeAction, {

		fileData : null,
		fileName : null,
		modelNode : null,
		updatedNode : null,
		operation : 'copy',
		
		wsArguments : [
			'modelRef',
			'filedata', 
			'filename',
			'updatedReplyRef',
			{ name : 'operation', defaultValue : 'copy' }
		],
						
		prepare : function() {
			
			Yamma.Actions.NodeAction.prepare.call(this);
			
			var 
				modelRef = this.parseArgs['modelRef'],
				updatedReplyRef = this.parseArgs['updatedReplyRef']
			;
			
			this.modelNode = modelRef ? this.extractNode(modelRef) : null;
			this.updatedNode = updatedReplyRef ? this.extractNode(updatedReplyRef) : null;
			
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
			
			if (this.updatedNode) {
				return ReplyUtils.canUpdate(this.updatedNode, this.fullyAuthenticatedUserName);
			} else {
				return ActionUtils.canReply(this.node, this.fullyAuthenticatedUserName);
			}
			
		},
		
		doExecute : function(node) {
			
			this.attachReply();
			
		},
		
		attachReply : function() {
			
			var replyNode = null;
			
			this.repliesContainer = ReplyUtils.getRepliesContainer(this.node, /* createIfNotExists */ true);
			
			if (null == this.modelNode) {
				replyNode = this.attachUploadedContent();
			} else {
				replyNode = this.attachRepositoryFile();
			}
			
			if (null != this.updatedNode) { // new reply created
				
				// TODO: Active this part (or remove it)
				// We need to decide if we update the replied-document history or
				// the reply history. If the document-history is updated then the
				// client is responsible to refresh the document-history when a reply
				// is modified.
				
				// log change in history
				// this.addHistoryEvent();
				
			}
			else {
				ReplyUtils.addReply(
					this.node, /* document */ 
					replyNode /* replyNode */
				);				
			}
			
			return ({
				reply : Utils.asString(replyNode.nodeRef)
			}); // outcome
			
		},
		
		attachUploadedContent : function() {
			
			var 
				replyNode = null != this.updatedNode ? this.updatedNode :
					UploadUtils.getContainerChildByName(
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
		
		getActionOutcome : function() {
			
			var actionOutcome = Actions.NodeAction.getActionOutcome.call(this);
			return actionOutcome;
			
		},
		
		addHistoryEvent : function() {
			
			this.updateDocumentHistory(
				'updatedReply.history', /* commentKey */ 
				null, /* commentArgs */
				this.fullyAuthenticatedUserName, /* referrer */
				this.fullyAuthenticatedUserName /* delegate */
			);
			
		}
		
		
	});

	
	
})();