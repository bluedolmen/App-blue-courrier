package org.bluedolmen.alfresco.workflows.jbpm;

import org.alfresco.service.ServiceRegistry;


public abstract class ReassignCredentialTester {
	
	public abstract boolean canReassign(String taskId, String userName);
	
	public void init() {
		
		workflowUtils.reassignCredentialTesters.add(this);
		
	}
	
	private WorkflowUtils workflowUtils;
	private ServiceRegistry serviceRegistry;
	
	public void setWorkflowUtils(WorkflowUtils workflowUtils) {
		this.workflowUtils = workflowUtils;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
	
	protected ServiceRegistry getServiceRegistry() {
		return serviceRegistry;
	}
	

}
