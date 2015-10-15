///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	if (null == taskId) return false;
	
	var task = workflow.getTask(taskId);
	if (null == task) return false;
	
	var 
		routedDocument = (workflowUtils.getPackageResources(task) || [null])[0]
	;
	if (null == routedDocument) return false;
	
	var serviceName = Utils.Alfresco.getEnclosingSiteName(routedDocument);
	if (null == serviceName) return false;

	var userName = person.properties['cm:userName'];
	if (null == userName) return false;
	
	return ServicesUtils.isServiceManager(serviceName, userName);

})();
