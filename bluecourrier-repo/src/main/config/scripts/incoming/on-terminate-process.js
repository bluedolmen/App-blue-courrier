///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var 
		document = BPMUtils.getFirstPackageResource(),
		tasks = workflowUtils.getTasksForNode(document)
	;
	
	incomingWorkflowHelper.endWaitingTask();

})();