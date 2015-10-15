///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var 
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		owner = Utils.wrapString(task.assignee), // is the task assigned?
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName()
	;
	
	if (null == document) return;
	
	storeCurrentInstructor();
	if (null == owner) return;
	
//	updateHistory();
	giveRightsToActor(document);
	
	/*
	 * Do not reassign replies-processing.
	 * DEACTIVATED: see hereafter
	 */
//	reassignRepliesProcessing(); 
	
	// END
	
	
//	function updateHistory() {
//		
//		var instructorDisplayName = Utils.Alfresco.getPersonDisplayName(owner, true /* displayUserName */);
//		HistoryUtils.addEvent(document, {
//			eventType : 'assignInstructor',
//			key : 'yamma.actions.assign.comment',
//			args : [ instructorDisplayName ]
//		});
//		
//	}
	
	/*
	 * For each reply in processing, we have to reassign
	 * the workflow task and give the rights to the new actor.
	 * BUT only on the tasks the previous owner was is charge of.
	 * <p>
	 * Currently, we do not know this information, that's why
	 * we prefer to deactivate this part.
	 * TODO: Review this part when necessary 
	 */
	function reassignRepliesProcessing() {
		
		var replyNodes = ReplyUtils.getReplies(document);
		
		Utils.forEach(replyNodes, function(replyNode) {
			
			var replyTasks = getProcessingTasks(replyNode);
			Utils.forEach(replyTasks, function(task) {
				reassignTask(task);
			});

			logActorChange(replyNode);
			
		});
		
	}
	
	function getProcessingTasks(/* ScriptNode */ replyNode) {
		
		var replyTasks = workflowUtils.getTasksForNode(replyNode);
		return Utils.filter(replyTasks, function(task) {
			return 'outgoingDocument' == Utils.wrapString(task.name);
		});
		
	}
	
	function logActorChange(/* ScriptNode */ documentNode) {
		
		var message = Utils.Alfresco.getMessage('yamma.actions.reassign.processing', [ documentNode.name] );
		HistoryUtils.addHistoryEvent(documentNode, 'reassign', message);
		
	}
	
	function giveRightsToActor(/* ScriptNode */ documentNode, role) {
		
		role = role || 'Collaborator';
		
		var documentContainer = DocumentUtils.getDocumentContainer(documentNode);
		documentContainer.setPermission(role, owner);
//		documentContainer.setPermission('Delete', owner); // also enable the user to move the document outside the inbox tray
		
	}
	
	function reassignTask(/* JScriptWorkflowTask */ task) {
		
		workflowUtils.claimTask(task, owner /* userName */, true /* force */);
		
	}
	
	function storeCurrentInstructor() {
		
		if (null == owner) {
			bdNodeUtils.removeProperty(document, 'bcinwf:instructorUserName');
			return;
		}
		
		document.properties['bcinwf:instructorUserName'] = owner;
		document.save();
		
	}
	
})();
