///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var 
		workflowinstance = workflow.getInstance(workflowinstanceid),
		tasks = BPMUtils.getTasksForWorkflow(workflowinstance)
	;

	endWorkflowIfNecessary();
	
	function endWorkflowIfNecessary() {
		
		if (Utils.Array.exists(tasks, function(task) {
			return 'Completed' != BPMUtils.getTaskStatus(task);
		}) ) return;
		
		workflowinstance.cancel();
		
	}

})();