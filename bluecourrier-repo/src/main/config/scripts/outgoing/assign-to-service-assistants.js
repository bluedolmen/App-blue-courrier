///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var
		document,
		serviceName = Utils.asString(BPMUtils.getContextVariable('serviceName'))
	;
	
	if (!serviceName) {
		document = Utils.Alfresco.BPM.getFirstPackageResource();
		// Assign the enclosing service name
		serviceName = Utils.Alfresco.getEnclosingSiteName(document);
	}
	
	if (!ServicesUtils.isService(serviceName)) {
		throw new Error("IllegalStateException! The provided service-name '" + serviceName + "' is not a valid service.");
	}
	
	assignTask();
	
	/*
	 * A delivering task is assigned to the service-assistants of the
	 * processing service
	 */ 
	function assignTask() {
		
		var 
			siteRoleGroup = ServicesUtils.getSiteRoleGroup(serviceName, ServicesUtils.SERVICE_ASSISTANT_ROLENAME),
			siteRoleGroupAuthorityName = siteRoleGroup != null ? siteRoleGroup.properties.authorityName : null
		;
		if (null == siteRoleGroupAuthorityName) return null;
		
		// Activiti Alfresco integration use the authority name to identify the candidate-group
//		logger.debug('Assigning task to ' + siteRoleGroupAuthorityName);
		task.addCandidateGroup(siteRoleGroupAuthorityName);
		
	}
	
})();
