package org.bluedolmen.alfresco.yamma.wf;

import java.util.Map;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.delegate.DelegateExecution;
import org.alfresco.repo.workflow.activiti.listener.ScriptExecutionListener;

public class IncomingWorkflowScriptExecutionListener extends ScriptExecutionListener {

	/**
	 * 
	 */
	private static final long serialVersionUID = 857072633967711653L;

	@Override
	protected Map<String, Object> getInputMap(DelegateExecution execution, String runAsUser) {
		
		final Map<String, Object> inputMap = super.getInputMap(execution, runAsUser);
		final String processInstanceId = execution.getProcessInstanceId();
		
		final RuntimeService runtimeService = execution.getEngineServices().getRuntimeService();
		inputMap.put(IncomingWorkflowHelper.HELPER_SCRIPT_BINDING_NAME, new IncomingWorkflowHelperScript(runtimeService, processInstanceId));
		
		return inputMap;
		
	}
	
	public class IncomingWorkflowHelperScript {
		
		private final RuntimeService runtimeService;
		private final String processInstanceId;
		
		private IncomingWorkflowHelperScript(final RuntimeService runtimeService, String processInstanceId) {
			this.runtimeService = runtimeService;
			this.processInstanceId = processInstanceId;
		}
			
		public boolean addDeliveryService(final String serviceAndRole) {
			
			return IncomingWorkflowHelper.addNewServiceRole(runtimeService, processInstanceId, serviceAndRole);
			
		}
		
		public boolean endWaitingTask() {
			
			return IncomingWorkflowHelper.addNewServiceRole(runtimeService, processInstanceId, null);
			
		}
		
		public void endProcess() {
			
			runtimeService.deleteProcessInstance(processInstanceId, null);
			
		}
		
		
	}
	
}
