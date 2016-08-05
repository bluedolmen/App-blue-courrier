///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var 
		document = BPMUtils.getFirstPackageResource(),
		serviceRole = BPMUtils.getContextVariable('serviceRole')
	;

	if (Yamma.DeliveryUtils.ROLE_PROCESSING != serviceRole) return; // This operation is limited to the main flow

	setEndProcessing(document);
	endCollaborationTasks(document);
	
	
	function endCollaborationTasks(document) {
		
		var collaborationTasks = getCollaborationTasks(document);
		Utils.Array.forEach(collaborationTasks, function(task) {
			
			var transitions = workflowUtils.getTransitions(task); // transitions is a map
			if (undefined === transitions['Done']) {
				logger.warn("No transition named 'Done' on task " + task.id + "(" + task.name + ")");
				return;
			}
			
			task.endTask('Done');
			
		});
		
	}
	
	function getCollaborationTasks(/* ScriptNode */ document) {
		
		var tasks = BPMUtils.getTasksForWorkflow(workflowinstanceid);
		
		return BPMUtils.filterTasks(tasks, function(task) {
			
			var 
				serviceRole = Utils.asString(task.properties['bcinwf:serviceRole']),
				status = BPMUtils.getTaskStatus(task)
			;
			return (
				BPMUtils.TaskStatus.COMPLETED != status &&
				Yamma.DeliveryUtils.ROLE_COLLABORATION == serviceRole
			);
			
		});
		
	}
	
	function setEndProcessing(document) {
		
		DocumentUtils.setDocumentState(document, 'processed');
		
		document.properties['bcinwf:endProcessingDate'] = new Date();
		document.save();
		
	}
		
	
})();