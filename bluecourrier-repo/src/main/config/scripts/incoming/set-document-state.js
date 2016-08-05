///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	if ('undefined' == typeof task) return;
	
	var 
		document = BPMUtils.getFirstPackageResource(),
		taskName = task.taskDefinitionKey,
		state = DocumentUtils.DOCUMENT_INCOMING_TASK_STATUS[taskName],
		serviceRole = BPMUtils.getContextVariable('serviceRole')
//		serviceName = BPMUtils.getContextVariable('serviceName')
	;
	
//	logger.warn('Entering task ' + task.name + '(' + task.id + ') for service ' + serviceName + ' with role ' + serviceRole);

	if ('procg' != serviceRole) return; // This operation is limited to the main flow

	DocumentUtils.setDocumentState(document, state);
	
})();