///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	if (null == taskId) return false;
	
	var task = workflow.getTask(taskId);
	if (null == task) return false;
	
	var userName = person.properties['cm:userName'];
	if (null == userName) return false;
	
	// If it is an application administrator, then it's ok
	if (yammaHelper.isApplicationAdministrator(userName)) return true;
	
	// Else check it is a manager of the service
	var routedDocument = (workflowUtils.getPackageResources(task) || [null])[0];
	if (null == routedDocument) return false;
	
	var serviceName = Utils.Alfresco.getEnclosingSiteName(routedDocument);
	if (null == serviceName) return false;
	
	return ServicesUtils.isServiceManager(serviceName, userName);

})();
