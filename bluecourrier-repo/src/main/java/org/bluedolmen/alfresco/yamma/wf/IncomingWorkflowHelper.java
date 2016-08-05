package org.bluedolmen.alfresco.yamma.wf;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.runtime.Execution;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.workflow.BPMEngineRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.workflow.WorkflowDefinition;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.service.cmr.workflow.WorkflowTask;
import org.alfresco.service.namespace.QName;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.alfresco.workflows.jbpm.WorkflowUtils;

public class IncomingWorkflowHelper {
	
	public static final String HELPER_SCRIPT_BINDING_NAME = "incomingWorkflowHelper";

	static final String WAIT_RECEIVE_TASK_NAME = "waitingForNewServices";
	static final String SERVICE_AND_ROLE_VARIABLE_NAME = "serviceAndRole";
	private static final Log logger = LogFactory.getLog(IncomingWorkflowHelper.class);
	private static final QName PROP_SERVICE_NAME = QName.createQName("{http://www.bluedolmen.org/model/bcincomingworkflow/1.0}serviceName");
	
	private WorkflowUtils workflowUtils;
	private WorkflowService workflowService;
	private RuntimeService runtimeService;
	private String incomingWorklfowName = "activiti$incomingDocument";
	private IncomingWorkflowHelperScript scriptInstance;
	
	public class IncomingWorkflowHelperScript extends BaseScopableProcessorExtension {
		
		private IncomingWorkflowHelperScript() {}
			
		public boolean isAcceptingDelivery(final ScriptNode node) {
			
			if (null == node) return false;
			return IncomingWorkflowHelper.this.isAcceptingDelivery(node.getNodeRef());
			
		}
		
		public boolean addDeliveryService(final ScriptNode node, final String serviceAndRole) {
			
			if (null == node) return false;
			return IncomingWorkflowHelper.this.addDeliveryService(node.getNodeRef(), serviceAndRole);
			
		}
		
		public boolean endWaitingTask(final ScriptNode node) {
			
			if (null == node) return false;
			return IncomingWorkflowHelper.this.endWaitingTask(node.getNodeRef());
			
		}
		
		@Override
		public String getExtensionName() {
			return HELPER_SCRIPT_BINDING_NAME;
		}
		
	}

	public IncomingWorkflowHelperScript getScriptInstance() {
		
		if (null == scriptInstance) {
			scriptInstance = new IncomingWorkflowHelperScript();
		}
		
		return scriptInstance;
		
	}
	
	
	/**
	 * 
	 * @param processInstanceId
	 * @param serviceAndRole
	 *            the service and role encoded as a 'service|role' string, maybe
	 *            empty (or null) to end the waiting task
	 * @return true if the serviceAndRole could be applied successfully
	 */
	boolean addNewServiceRole(String processInstanceId, String serviceAndRole) {
		
		return addNewServiceRole(runtimeService, processInstanceId, serviceAndRole);
		
	}
	
	static boolean addNewServiceRole(RuntimeService runtimeService, String processInstanceId, String serviceAndRole) {
		
		if (null == runtimeService) {
			throw new NullPointerException("The runtime-service is mandatory.");
		}
		
		final Execution execution_ = runtimeService
				.createExecutionQuery()
				.processInstanceId(processInstanceId)
				.activityId(WAIT_RECEIVE_TASK_NAME)
				.singleResult();
		
		if (null == execution_) {
			if (logger.isErrorEnabled()) {
				logger.error("Cannot find any waiting receive-task for process-id '" + processInstanceId + "'. No actual delivery will be performed.");
			}
			return false;
		}
		
		if (logger.isDebugEnabled()) {
			if (StringUtils.isEmpty(serviceAndRole)) {
				logger.debug("Terminating waiting state with empty serviceAndRole");
			}
			else {
				logger.debug("Adding service and role '" + serviceAndRole + "'");
			}
		}
		
		final Map<String, Object> variables = new HashMap<String, Object>(1);
		variables.put(SERVICE_AND_ROLE_VARIABLE_NAME, serviceAndRole);
		
		runtimeService.signal(execution_.getId(), variables);
		
		return true;
		
	}
	
	public boolean isAcceptingDelivery(NodeRef nodeRef) {
		
		if (null == nodeRef) return false;
		
		final WorkflowInstance wi = getFirstIncomingDeliveryWorkflow(nodeRef);
		return null != wi;
		
	}
	
	/**
	 * @param nodeRef
	 * @param serviceAndRole
	 *            the service and optional role encoded as a string
	 *            service|role. Service matches with the short-name of a site.
	 * @return true if the new service and role could be applied
	 */
	public boolean addDeliveryService(NodeRef nodeRef, String serviceAndRole) {
		
		if (null == nodeRef) throw new NullPointerException("Cannot add new services on a null node.");
		serviceAndRole = getCheckedServiceAndRole(serviceAndRole);
		if (StringUtils.isEmpty(serviceAndRole)) return false;
		
//		final String serviceName = serviceAndRole.split("\\|")[0];
//		if (isServiceTaskRunning(nodeRef, serviceName)) {
//			if (logger.isInfoEnabled()) {
//				logger.info(String.format("Cannot add delivery-service '%s' since there is already a delivery-task running on it."));
//				return false;
//			}
//		}

		final WorkflowInstance wi = getFirstIncomingDeliveryWorkflow(nodeRef);
		if (null == wi) return false;
		
		final String processInstanceId = BPMEngineRegistry.getLocalId(wi.getId());
		return addNewServiceRole(processInstanceId, serviceAndRole);
		
	}
	
	public boolean endWaitingTask(NodeRef nodeRef) {
		
		if (null == nodeRef) throw new NullPointerException("Cannot terminate waiting-task on a null node.");
		
		final WorkflowInstance wi = getFirstIncomingDeliveryWorkflow(nodeRef);
		if (null == wi) return false;
		
		final String processInstanceId = BPMEngineRegistry.getLocalId(wi.getId());
		return addNewServiceRole(processInstanceId, null);
		
	}
	
	private String getCheckedServiceAndRole(String serviceAndRole) {
		
		if (StringUtils.isEmpty(serviceAndRole)) return serviceAndRole;
		final String[] split = serviceAndRole.split("\\|");
		final String service = split[0];
		String role = split.length > 1  ? split[1] : "inf";
		
		if (!StringUtils.isEmpty(role) && !"inf".equals(role)) {
			logger.warn(String.format("Role '%s' cannot be used while adding a delivery service without control.", role));
			role = "inf";
		}
		
		return service + "|" + role;
		
	}
	
	private boolean isServiceTaskRunning(NodeRef nodeRef, String targetServiceName) {
		
		if (StringUtils.isEmpty(targetServiceName)) return false;
		
		final List<WorkflowTask> workflowTasks = workflowUtils.getActiveTasksForNode(nodeRef, Collections.singleton(incomingWorklfowName), null);
		for (final WorkflowTask workflowTask : workflowTasks) {
			
			final String serviceName = (String) workflowTask.getProperties().get(PROP_SERVICE_NAME);
			if (StringUtils.isEmpty(serviceName)) continue;
			
			if (serviceName.equals(targetServiceName)) return true;
			
		}
		
		return false;
		
	}
	
	private WorkflowInstance getFirstIncomingDeliveryWorkflow(NodeRef nodeRef) {
		
		final List<WorkflowInstance> workflowInstances = workflowService.getWorkflowsForContent(nodeRef, true /* active */);
		if (workflowInstances.isEmpty()) return null;
		
		for (final WorkflowInstance workflowInstance : workflowInstances) {
			
			final WorkflowDefinition wd = workflowInstance.getDefinition();
			if (null == wd) continue;
			
			if (incomingWorklfowName.equals(wd.getName())) return workflowInstance;
			
		}
		
		return null;
		
	}
	
	public void setWorkflowUtils(WorkflowUtils workflowUtils) {
		this.workflowUtils = workflowUtils;
	}
	
	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}
	
	public void setIncomingWorkflowName(String workflowName) {
		this.incomingWorklfowName = workflowName;
	}
	
	public void setRuntimeService(RuntimeService runtimeService) {
		this.runtimeService = runtimeService;
	}

}
