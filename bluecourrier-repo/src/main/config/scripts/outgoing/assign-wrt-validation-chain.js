///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var
		validationChain = Utils.toArray(BPMUtils.getContextVariable('bcogwf_validationChain') || [])
	;
	
	if (Utils.Array.isEmpty(validationChain)) {
		logger.warn("There is no actor in the validation chain. Do not assign task " + task.id + "(" + task.name + ")");
		return;
	}
	
	assignTask();
	storeValidationChain();
	
	function assignTask() {
		
		var firstActor = validationChain[0];
		
		// Activiti Alfresco integration use the authority name to identify the user
		task.setAssignee(firstActor);
		
	}
	
	function storeValidationChain() {
		
		validationChain = validationChain.slice(1);
		execution.setVariable('bcogwf_validationChain', workflowUtils.toJavaCollection(validationChain)); // Activiti/Alfresco does not wrap native Javascript arrays 

	}
	
})();
