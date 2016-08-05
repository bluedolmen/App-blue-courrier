///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">


(function() {
	
	var
		instructorName = Utils.asString(BPMUtils.getContextVariable('bcogwf_instructor'))
			|| Utils.asString(BPMUtils.getContextVariable('bpm_assignee'))
	;
	
	assignTask();
	
	/*
	 * A delivering task is assigned to the service-assistants of the
	 * processing service
	 */ 
	function assignTask() {
		
		var serviceName, siteRoleGroup, siteRoleGroupAuthorityName;
		
		task.addCandidateGroup(getInstructorSiteRoleGroup());
		
		instructorName = instructorName || getCurrentActorName();
		
		if (instructorName) {
			task.setAssignee(instructorName);
		}

	}
	
	function getCurrentActorName() {
		
		if ('undefined' == typeof person) return null;
		return Utils.asString(person.properties['cm:userName']);
		
	}
	
	function getInstructorSiteRoleGroup() {
		
		var serviceName, siteRoleGroup, siteRoleGroupAuthorityName;
		
		serviceName = Yamma.DeliveryUtils.getBPMContextualServiceName();
		if (!ServicesUtils.isService(serviceName)) {
			throw new Error("IllegalStateException! The provided service-name '" + serviceName + "' is not a valid service.");
		}

		siteRoleGroup = ServicesUtils.getSiteRoleGroup(serviceName, ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME);
		siteRoleGroupAuthorityName = siteRoleGroup != null ? siteRoleGroup.properties.authorityName : null;
		if (null == siteRoleGroupAuthorityName) {
			throw new Error('IllegalStateException! No assignee to processing task at this point');
		}
		
		return siteRoleGroupAuthorityName;
		
	}

	
})();
