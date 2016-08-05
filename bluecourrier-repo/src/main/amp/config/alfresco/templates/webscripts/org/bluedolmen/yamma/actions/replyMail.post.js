///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/copy-utils.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/outmail-utils.js">

(function() {
	
	var fullAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();

	Yamma.Actions.ReplyMailAction = Utils.Object.create(Yamma.Actions.NodeAction, {

		fileData : null,
		fileName : null,
		modelNode : null,
		updatedNode : null,
		operation : 'copy',
		signed : false,
		task : null,
		
		wsArguments : [
			'modelRef',
			'filedata', 
			'filename',
			'updatedReplyRef',
			'signed',
			{ name : 'operation', defaultValue : 'copy' },
			'taskRef'
		],
						
		prepare : function() {
			
			Yamma.Actions.NodeAction.prepare.call(this);
			
			var 
				modelRef = this.parseArgs['modelRef'],
				updatedReplyRef = this.parseArgs['updatedReplyRef'],
				fileData, tasks
			;
			
			this.modelNode = modelRef ? Utils.Alfresco.getExistingNode(modelRef) : null;
			this.updatedNode = updatedReplyRef ? Utils.Alfresco.getExistingNode(updatedReplyRef) : null;
			
			fileData = this.parseArgs['filedata'];
			if (null != fileData) {
				if (null == fileData.content) {
					throw {
						code : 400,
						message : 'IllegalStateException! The provided filedata is not a file-data field object as expected'
					};
				}
				this.fileData = fileData.content; // extract content from file-data field
			}
				
			this.fileName = this.parseArgs['filename'] || ( this.fileData ? this.fileData.filename : null ); // overriding file-name
			this.operation = this.parseArgs['operation'];
			this.signed = 'true' === Utils.asString(this.parseArgs['signed']);
			
			if (null == fileData && null == modelRef) {
				throw {
					code : 400,
					message : 'IllegalStateException! Either filedata or modelRef should be provided to this service'
				};				
			}
			
			taskRef = this.parseArgs['taskRef'];
			if (null != taskRef) {
				// This may be an array, in this case we take the first ref
				tasks = Utils.String.splitToTrimmedStringArray(taskRef);
				if (tasks[0]) {
					this.task = workflow.getTask(tasks[0]);
				}
			}
			
		},		
		
		isExecutable : function(node) {
			
			var repliesContainer = ReplyUtils.getRepliesContainer(node);
			if (null == repliesContainer) return false;
			
			if (!repliesContainer.hasPermission('AddChildren')) return false;
			if (null != this.updatedNode) {
				return this.updatedNode.hasPermission('Write');
			}
			
			return true;
			
		},
		
//		beforeExecute : function(node) {
//			
//			var tasks = Utils.Alfresco.BPM.getMyFilteredNodeTasks(node, ['bcwfincoming:Processing','bcwfincoming:Replied']);
//			if (tasks.length > 1) {
//				logger.error('[replyMail] Several tasks can add a reply, taking first only; the behaviour may thus not be correct!');
//			}
//			this.task = tasks[0];
//			
//			Yamma.Actions.NodeAction.beforeExecute.call(this, node);
//			
//		},
		
		doExecute : function(node) {
			
			return this.attachReply();
			
		},
		
		attachReply : function() {
			
			function fixPermissions(replyNode) {
				
				var
					replyContainer = DocumentUtils.getDocumentContainer(replyNode)
				;
				
				/*
				 * Change reply ownership to avoid the user to be able to
				 * change the comments of the other users
				 */ 
				
				if (null != replyContainer) {
					replyContainer.setPermission('Collaborator', fullAuthenticatedUserName);
				}
				
				replyNode.owner = 'admin';
				replyContainer.owner = 'admin';
				
			}
			
			this.repliesContainer = ReplyUtils.getRepliesContainer(this.node, /* createIfNotExists */ true);
			
			var replyNode = (null == this.modelNode) 
				? this.attachUploadedContent()
				: this.attachRepositoryFile()
			;
			
			if (null != this.updatedNode) { // update of the existing reply 
				
				// TODO: Active this part (or remove it)
				// We need to decide if we update the replied-document history or
				// the reply history. If the document-history is updated then the
				// client is responsible to refresh the document-history when a reply
				// is modified.
				
				// log change in history
				// this.addHistoryEvent();
				
			}
			else { // new reply created
				
				ReplyUtils.addReply(
					this.node, /* document */ 
					replyNode, /* replyNode */
					null != this.task /* omitHistoryEvent */
				);
				
				fixPermissions(replyNode);
				
				OutgoingMailUtils.startOutgoingWorkflow(replyNode);
				
			}
			
			this.updateTask(replyNode);
			
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
						{aspects : [YammaModel.MAIL_ASPECT_SHORTNAME, YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME]} /* createConfig */
					)
			;
			
			UploadUtils.updateContent(replyNode, this.fileData, {
				filename : this.fileName,
				versionLabel : this.signed ? 'beforeSigning' : null
			});
			
			return replyNode;
			
		},
		
		attachRepositoryFile : function() {
			
			var 
				newDocumentNode = this.modelNode,
				success = null
			;

			if ('move' == this.operation) {
				success = this.modelNode.move(this.repliesContainer);
				if (true === success) return this.modelNode;
				
				logger.warn(
					"Cannot move node '" + this.modelNode.nodeRef + "'" +
					" to desintation '" + this.repliesContainer.nodeRef + "'." +
					" Performs a copy instead."
				);
			}
			
			newDocumentNode = CopyUtils.copyToDestination(this.modelNode, this.repliesContainer, this.filename);
			newDocumentNode.addAspect(YammaModel.MAIL_ASPECT_SHORTNAME);
			newDocumentNode.addAspect(YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME);
			
			return newDocumentNode;
			
		},
		
		updateTask : function(replyNode) {
			
			if (null == this.task) return;

			workflowUtils.updateTaskProperties(this.task, {
				'bcinwf:reply' : replyNode
			});
			
			this.task.endTask('Add Reply');

		},
		
		getActionOutcome : function() {
			
			var actionOutcome = Actions.NodeAction.getActionOutcome.call(this);
			return actionOutcome;
			
		}
		
//		addHistoryEvent : function() {
//			
//			this.updateDocumentHistory(
//				'updatedReply.history', /* commentKey */ 
//				null, /* commentArgs */
//				this.fullyAuthenticatedUserName, /* referrer */
//				this.fullyAuthenticatedUserName /* delegate */
//			);
//			
//		}		
		
	});

	Yamma.Actions.ReplyMailAction.execute();
	
})();