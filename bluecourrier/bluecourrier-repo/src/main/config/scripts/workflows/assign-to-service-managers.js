///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
(function() {
	
	var
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		serviceName = Utils.asString(BPMUtils.getContextVariable('serviceName')) 
	;
	
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
			siteRoleGroup = ServicesUtils.getSiteRoleGroup(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME),
			siteRoleGroupAuthorityName = siteRoleGroup != null ? siteRoleGroup.properties.authorityName : null
		;
		if (null == siteRoleGroupAuthorityName) return null;
		
		// Activiti Alfresco integration use the authority name to identify the candidate-group
		task.addCandidateGroup(siteRoleGroupAuthorityName);
		
	}
	
})();
