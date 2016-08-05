///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var
		instructorName = Utils.asString(BPMUtils.getContextVariable('bcinwf_instructor'))
	;
	
	assignTask();
	
	/*
	 * A delivering task is assigned to the service-assistants of the
	 * processing service
	 */ 
	function assignTask() {
		
		// No instructor, the following code will assign any of the instructor of the contextual service
		// Activiti Alfresco integration use the authority name to identify the candidate-group
		task.addCandidateGroup(getInstructorSiteRoleGroup());
		
		if (instructorName) {
			
			task.setAssignee(instructorName);
			
			/*
			 * Check whether the current user is the instructor.
			 * If applicable, then we also set the task "In Progress"
			 * <p>
			 * A collaborator also do not need to mark the task as started (functional choice)
			 */
			if (!isDefaultProcessKind() || isCurrentActorTheInstructor()) {
				startTask();
			}
			
			return;
			
		}
		
	}
	
	function isCurrentActorTheInstructor() {

		return ('undefined' != typeof person && Utils.asString(person.properties['cm:userName']) == instructorName);
		
	}
	
	function isDefaultProcessKind() {
		
		var processKind = Utils.asString(BPMUtils.getContextVariable('bcinwf_processKind'));
		return Yamma.DeliveryUtils.getDefaultProcessKind() == processKind;
		
	}
	
	function startTask() {
		
		// We cannot use BPMUtils since the API is based on the Alfresco wrapped tasks
		// This is kind of dirty (low-level) and should be replaced with a clean method
		task.setVariable('bpm_status', BPMUtils.TaskStatus.IN_PROGRESS);
		
	}
	
	function getInstructorSiteRoleGroup() {
		
		var serviceName, siteRoleGroup, siteRoleGroupAuthorityName;
		
		serviceName = task.getVariable('bcinwf_serviceName'); //Yamma.DeliveryUtils.getBPMContextualServiceName();
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
