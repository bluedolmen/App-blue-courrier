package com.bluexml.alfresco.yamma;

import java.io.Serializable;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.NodeServicePolicies.OnUpdatePropertiesPolicy;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.transaction.RetryingTransactionHelper;
import org.alfresco.repo.transaction.RetryingTransactionHelper.RetryingTransactionCallback;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.datatype.DefaultTypeConverter;
import org.alfresco.service.namespace.NamespacePrefixResolver;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.util.EqualsHelper;
import org.alfresco.util.PropertyCheck;
import org.apache.log4j.Logger;

/**
 * This behavior enables to route a document with a state in a sibling folder given
 * its state.
 * 
 * This component may be generalized to be reused in various similar projects.
 * 
 * @author pajot-b
 *
 */
public class StateRouter implements OnUpdatePropertiesPolicy {
	
	private final Logger logger = Logger.getLogger(getClass());

	protected QName targetContainerType = ContentModel.TYPE_FOLDER;
	protected QName stateTypeQName = ContentModel.TYPE_CMOBJECT;
	protected QName statePropertyQName = null;
	
	private PolicyComponent policyComponent;
	private NodeService nodeService;
	private RetryingTransactionHelper retryingTransactionHelper;
	private NamespacePrefixResolver prefixResolver;
	
    /**
     * Spring bean init method
     */
    public void init()
    {
        PropertyCheck.mandatory(this, "policyComponent", policyComponent);
        PropertyCheck.mandatory(this, "nodeService", nodeService);
        PropertyCheck.mandatory(this, "retryingTransactionHelper", retryingTransactionHelper);
        PropertyCheck.mandatory(this, "prefixResolver", prefixResolver);
        PropertyCheck.mandatory(this, "statePropertyQName", statePropertyQName);
        
        this.policyComponent.bindClassBehaviour(
                OnUpdatePropertiesPolicy.QNAME,
                stateTypeQName,
                new JavaBehaviour(this, "onUpdateProperties", NotificationFrequency.TRANSACTION_COMMIT)
        );
        
    }
	
	public void onUpdateProperties(NodeRef nodeRef, Map<QName, Serializable> before, Map<QName, Serializable> after) {
		
        final String stateAfter = DefaultTypeConverter.INSTANCE.convert(String.class, after.get(statePropertyQName));
        if (stateAfter == null) return;
        
        final String stateBefore = DefaultTypeConverter.INSTANCE.convert(String.class, before.get(statePropertyQName));
        if (EqualsHelper.nullSafeEquals(stateBefore, stateAfter)) return;

        routeDocument(nodeRef, stateAfter);		
	}
	
	public void routeDocument(NodeRef documentNodeRef, String newState) {
		
		final NodeRef targetContainer = getOrCreateTargetTray(documentNodeRef, newState);
		final NodeRef actualDocumentNodeRef = getActualDocument(documentNodeRef);
		
		nodeService.moveNode(actualDocumentNodeRef, targetContainer, null, null);
		
		if (logger.isDebugEnabled()) {
			final String containerName = (String) nodeService.getProperty(targetContainer, ContentModel.PROP_NAME);
			final String nodeName = (String) nodeService.getProperty(actualDocumentNodeRef, ContentModel.PROP_NAME);
			
			logger.debug(String.format("Routed document '%s' to container '%s'", nodeName, containerName));
		}
	}
	
	private NodeRef getOrCreateTargetTray(NodeRef documentNodeRef, String state) {
		final ChildAssociationRef childAssociationRef = nodeService.getPrimaryParent(documentNodeRef);
		final NodeRef parentNodeRef = childAssociationRef.getParentRef();
		
		NodeRef siblingTrayNodeRef = nodeService.getChildByName(parentNodeRef, ContentModel.ASSOC_CHILDREN, state);
		if (null == siblingTrayNodeRef) {
			siblingTrayNodeRef = createTargetTray(parentNodeRef, state);
		}
		
		return siblingTrayNodeRef;
	}
	
	private NodeRef createTargetTray(final NodeRef parentNodeRef, final String trayName) {
		
        final RunAsWork<NodeRef> createTrayRunAsWork = new RunAsWork<NodeRef>()
        {
            public NodeRef doWork() throws Exception
            {
            	return retryingTransactionHelper.doInTransaction(new RetryingTransactionCallback<NodeRef>() {

					public NodeRef execute() throws Throwable {
						return createContainer(parentNodeRef, trayName);
					}
				});
            	
            }
        };
        		
		return AuthenticationUtil.runAs(createTrayRunAsWork, AuthenticationUtil.getAdminUserName());
	}
	
	private NodeRef createContainer(NodeRef parentRef, String containerName) {
		
		final ChildAssociationRef newChildRef = nodeService.createNode(
				parentRef, 
				ContentModel.ASSOC_CHILDREN, 
				QName.createQNameWithValidLocalName(NamespaceService.CONTENT_MODEL_1_0_URI, containerName), 
				targetContainerType
		);
		
		if (null == newChildRef) {
			throw new IllegalStateException(
					String.format("Cannot create the sibling tray for state '%s'", containerName)
			);
		}
		
		return newChildRef.getChildRef();
		
	}
	
	// Spring IoC material
	
	protected NodeRef getActualDocument(NodeRef documentNodeRef) {
		return documentNodeRef;
	}	

	public void setPolicyComponent(PolicyComponent policyComponent) {
		this.policyComponent = policyComponent;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public NodeService getNodeService() {
		return this.nodeService;
	}
	
	public void setRetryingTransactionHelper(RetryingTransactionHelper retryingTransactionHelper) {
		this.retryingTransactionHelper = retryingTransactionHelper;
	}
	
	public void setPrefixResolver(NamespacePrefixResolver prefixResolver) {
		this.prefixResolver = prefixResolver;
	}
	
	public void setStatePropertyName(String name) {
		this.statePropertyQName = QName.createQName(name, prefixResolver);
	}
	
	public void setTargetFolderType(String typeName) {
		this.targetContainerType = QName.createQName(typeName, prefixResolver);
	}
	
}
