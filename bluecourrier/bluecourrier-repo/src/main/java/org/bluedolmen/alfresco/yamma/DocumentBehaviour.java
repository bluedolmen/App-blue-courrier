package org.bluedolmen.alfresco.yamma;

import java.util.Iterator;
import java.util.List;

import org.alfresco.repo.node.NodeServicePolicies.BeforeDeleteNodePolicy;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.repo.transaction.AlfrescoTransactionSupport;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.util.PropertyCheck;

public class DocumentBehaviour implements BeforeDeleteNodePolicy {

	private static final String ACTIVE_WORKFLOW_INSTANCES_KEY = "active-workflow-instances";
	
    private PolicyComponent policyComponent;
    private WorkflowService workflowService;
    private NodeService nodeService;
    
    /**
     * Init method.  Registered behaviours.
     */
    public void init() {
    	
        PropertyCheck.mandatory(this, "policyComponent", this.policyComponent);
        
        /**
         * Bind policies
         */
        this.policyComponent.bindClassBehaviour(
        		BeforeDeleteNodePolicy.QNAME, 
        		BlueCourrierModel.ASPECT_DOCUMENT, 
        		new JavaBehaviour(this, "beforeDeleteNode", NotificationFrequency.FIRST_EVENT)
        );

        this.policyComponent.bindClassBehaviour(
        		BeforeDeleteNodePolicy.QNAME, 
        		BlueCourrierModel.ASPECT_DOCUMENT, 
        		new JavaBehaviour(this, "removeActiveWorkflows", NotificationFrequency.TRANSACTION_COMMIT)
        );

    }
	
	@Override
	public void beforeDeleteNode(NodeRef nodeRef) {
		
		final List<WorkflowInstance> workflowInstances = workflowService.getWorkflowsForContent(nodeRef, true /* active-workflows */);
		AlfrescoTransactionSupport.bindResource(ACTIVE_WORKFLOW_INSTANCES_KEY, workflowInstances);

	}

	public void removeActiveWorkflows(NodeRef node) {
		
		final List<WorkflowInstance> workflowInstances = AlfrescoTransactionSupport.<List<WorkflowInstance>>getResource(ACTIVE_WORKFLOW_INSTANCES_KEY);
		if (null == workflowInstances) return;
		
		final Iterator<WorkflowInstance> it = workflowInstances.iterator();
		while (it.hasNext()) {
			final WorkflowInstance workflowInstance = it.next();
			workflowService.deleteWorkflow(workflowInstance.getId());
			it.remove();
		}
		
	}
	
    public void setPolicyComponent(PolicyComponent policyComponent) {
        this.policyComponent = policyComponent;
    }
    
    public void setWorkflowService(WorkflowService workflowService) {
    	this.workflowService = workflowService;
    }
    
    public void setNodeService(NodeService nodeService) {
    	this.nodeService = nodeService;
    }
    
    public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    	
    	this.setWorkflowService(serviceRegistry.getWorkflowService());
    	this.setNodeService(serviceRegistry.getNodeService());
    	
    }

	
}
