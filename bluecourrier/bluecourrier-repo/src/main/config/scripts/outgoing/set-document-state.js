///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	if ('undefined' == typeof task) return;
	
	var 
		document = BPMUtils.getFirstPackageResource(),
		taskName = task.taskDefinitionKey,
		state = DocumentUtils.DOCUMENT_OUTGOING_TASK_STATUS[taskName]
	;
	
	if (null != document && null != state) {
		DocumentUtils.setDocumentState(document, state);
	}
	
})();