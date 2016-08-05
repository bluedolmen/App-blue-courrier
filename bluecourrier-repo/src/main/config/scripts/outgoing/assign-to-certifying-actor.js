///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">


(function() {
	
	var
		signingActor = Utils.asString(BPMUtils.getContextVariable('bcogwf_signingActor'))
			|| Utils.asString(BPMUtils.getContextVariable('bpm_assignee'))
	;
	
	assignTask();
	
	function assignTask() {
		
		var serviceName, siteRoleGroup, siteRoleGroupAuthorityName;
		
		task.addCandidateGroup(getInstructorSiteRoleGroup()); // Used for re-assignation => Maybe revised w.r.t. real user-stories
		
		if (signingActor) {
			task.setAssignee(signingActor);
			return;
		}

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
