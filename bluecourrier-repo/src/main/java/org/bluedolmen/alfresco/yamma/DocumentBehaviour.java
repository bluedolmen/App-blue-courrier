package org.bluedolmen.alfresco.yamma;

import java.util.Iterator;
import java.util.List;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.repo.node.NodeServicePolicies.BeforeDeleteNodePolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnAddAspectPolicy;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.repo.transaction.AlfrescoTransactionSupport;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.transaction.TransactionService;
import org.alfresco.util.PropertyCheck;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bluedolmen.service.license.LicenseService;
import org.springframework.context.ApplicationEvent;
import org.springframework.extensions.surf.util.AbstractLifecycleBean;

public final class DocumentBehaviour extends AbstractLifecycleBean implements BeforeDeleteNodePolicy, OnAddAspectPolicy {

	private static final Log logger = LogFactory.getLog(DocumentBehaviour.class);
	private static final String ACTIVE_WORKFLOW_INSTANCES_KEY = "active-workflow-instances";
	private static final boolean _NLA_ = Boolean.parseBoolean("${nla}");
	
    private PolicyComponent policyComponent;
    private WorkflowService workflowService;
    @SuppressWarnings("unused")
	private NodeService nodeService;
    private TransactionService transactionService;
    private LicenseService licenseService;
    
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

        this.policyComponent.bindClassBehaviour(
        		OnAddAspectPolicy.QNAME, 
        		BlueCourrierModel.ASPECT_DOCUMENT, 
        		new JavaBehaviour(this, "onAddAspect", NotificationFrequency.EVERY_EVENT)
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
	
	@Override
	protected void onBootstrap(ApplicationEvent event) {
		
	}

	@Override
	protected void onShutdown(ApplicationEvent event) {
		
	}

	@Override
	public final void onAddAspect(NodeRef nodeRef, QName aspectTypeQName) {
		
		/**
		 * We do not want this to be disabled easily by reconfiguration, that's why
		 * we use this method
		 */
		if (null == licenseService) {
			final Object object = getApplicationContext().getBean("bluedolmen.LicenseService");
			if (null == object) {
				if (logger.isDebugEnabled()) {
					logger.debug("License-service cannot be found, checking will be disasbled");
				}
				return;
			}
			licenseService = (LicenseService) object;
		}
		
		if (!licenseService.isLicenseValid("bluecourrier").isValid() && !_NLA_) {

			throw new AlfrescoRuntimeException("Invalid license!");
			
		}
		
	}
	
    public void setPolicyComponent(PolicyComponent policyComponent) {
        this.policyComponent = policyComponent;
    }
    
    public void setWorkflowService(WorkflowService workflowService) {
    	this.workflowService = workflowService;
    }
    
    public void setTransactionService(TransactionService transactionService) {
    	this.transactionService = transactionService;
    }
    
    public void setNodeService(NodeService nodeService) {
    	this.nodeService = nodeService;
    }
    
    public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    	
    	this.setWorkflowService(serviceRegistry.getWorkflowService());
    	this.setNodeService(serviceRegistry.getNodeService());
    	this.setTransactionService(serviceRegistry.getTransactionService());
    	
    }

}
