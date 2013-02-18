package com.bluexml.alfresco.yamma;

import java.io.Serializable;
import java.util.Map;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.jscript.ScriptNode;
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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

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
	
    private static Log logger = LogFactory.getLog(ScriptNode.class);

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
		routeDocumentAsAdmin(documentNodeRef, newState);
	}
	
	private void routeDocumentAsAdmin(final NodeRef documentNodeRef, final String newState) {
		
        final RunAsWork<Void> createTrayRunAsWork = new RunAsWork<Void>() {
            
        	public Void doWork() throws Exception{
        		
            	return retryingTransactionHelper.doInTransaction(new RetryingTransactionCallback<Void>() {

					public Void execute() throws Throwable {
						
						final NodeRef actualDocumentNodeRef = getActualDocument(documentNodeRef);
						final NodeRef targetContainer = getOrCreateTargetTray(actualDocumentNodeRef, newState);
						
						nodeService.moveNode(
							actualDocumentNodeRef, 
							targetContainer, 
							ContentModel.ASSOC_CONTAINS, 
							null
						);
						
						if (logger.isDebugEnabled()) {
							final String containerName = (String) nodeService.getProperty(targetContainer, ContentModel.PROP_NAME);
							final String nodeName = (String) nodeService.getProperty(actualDocumentNodeRef, ContentModel.PROP_NAME);
							
							logger.debug(String.format("Routed document '%s' to container '%s'", nodeName, containerName));
						}
						
						return null;
						
					}
				});
            	
            }
        };
        		
		AuthenticationUtil.runAs(createTrayRunAsWork, AuthenticationUtil.getAdminUserName());
	}
	
	private NodeRef getOrCreateTargetTray(NodeRef documentNodeRef, String state) {
		
		final NodeRef currentTrayNodeRef = getCurrentTray(documentNodeRef);
		
		final ChildAssociationRef traysContainerAssociationRef = nodeService.getPrimaryParent(currentTrayNodeRef);
		final NodeRef traysContainerNodeRef = traysContainerAssociationRef.getParentRef();
		if (null == traysContainerNodeRef) {
			throw new IllegalStateException("Cannot get the trays container from the actual document");
		}
		
		final NodeRef siblingTrayNodeRef = nodeService.getChildByName(traysContainerNodeRef, ContentModel.ASSOC_CONTAINS, state);
		if (null != siblingTrayNodeRef) return siblingTrayNodeRef;
		
		return createTargetTray(traysContainerNodeRef, state);
		
	}
	
	private NodeRef getCurrentTray(NodeRef documentNodeRef) {
		
		final ChildAssociationRef childAssociationRef = nodeService.getPrimaryParent(documentNodeRef);
		final NodeRef trayNodeRef = childAssociationRef.getParentRef();
		if (null == trayNodeRef) {
			throw new IllegalStateException(
				String.format("Cannot get the tray containing the document '%s'", documentNodeRef)
			);
		}
		
		return trayNodeRef;
		
	}
	
	private NodeRef createTargetTray(final NodeRef parentNodeRef, final String trayName) {
		
    	return retryingTransactionHelper.doInTransaction(new RetryingTransactionCallback<NodeRef>() {

			public NodeRef execute() throws Throwable {
				return createContainer(parentNodeRef, trayName);
			}
			
		});
        		
	}
	
	private NodeRef createContainer(NodeRef parentRef, String containerName) {
		
		final ChildAssociationRef newChildRef = nodeService.createNode(
				parentRef, 
				ContentModel.ASSOC_CONTAINS, 
				QName.createQNameWithValidLocalName(NamespaceService.CONTENT_MODEL_1_0_URI, containerName), 
				targetContainerType
		);
		
		if (null == newChildRef) {
			throw new IllegalStateException(
					String.format("Cannot create the sibling tray for state '%s'", containerName)
			);
		}
		
		final NodeRef trayNodeRef = newChildRef.getChildRef();
		// Change the name of the folder to reflect the correct container-name
		nodeService.setProperty(trayNodeRef, ContentModel.PROP_NAME, containerName);
		
		return trayNodeRef;
		
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
