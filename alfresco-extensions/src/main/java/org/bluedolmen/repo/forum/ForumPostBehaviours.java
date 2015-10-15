package org.bluedolmen.repo.forum;

import java.io.Serializable;
import java.util.Map;

import org.alfresco.model.ForumModel;
import org.alfresco.repo.forum.CommentService;
import org.alfresco.repo.node.NodeServicePolicies.BeforeDeleteNodePolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnCreateNodePolicy;
import org.alfresco.repo.node.NodeServicePolicies.OnUpdatePropertiesPolicy;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.Behaviour.NotificationFrequency;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * This class registers behaviours for the {@link ForumModel#TYPE_POST fm:post} content type.
 */
public class ForumPostBehaviours {
    
    private static final Log log = LogFactory.getLog(ForumPostBehaviours.class);
    
    private PolicyComponent policyComponent;
    private CommentService commentService;
    private NodeService nodeService;
    protected ForumUtils forumUtils;
    
    private Behaviour onUpdatePostNode = new JavaBehaviour(this, "onUpdatePostNode", NotificationFrequency.TRANSACTION_COMMIT);
    private Behaviour onCreatePostNode = new JavaBehaviour(this, "onCreatePostNode", NotificationFrequency.TRANSACTION_COMMIT);
    private Behaviour onDeletePostNode = new JavaBehaviour(this, "beforeDeletePostNode");
    
    private boolean privateOnly;
    
    public void init() {
    	
    	this.policyComponent.bindClassBehaviour(
			OnUpdatePropertiesPolicy.QNAME,
			ForumModel.TYPE_POST,
			onUpdatePostNode
    	);
        
        this.policyComponent.bindClassBehaviour(
            OnCreateNodePolicy.QNAME,
            ForumModel.TYPE_POST,
            onCreatePostNode
        );
        
        this.policyComponent.bindClassBehaviour(
            BeforeDeleteNodePolicy.QNAME,
            ForumModel.TYPE_POST,
            onDeletePostNode
        );
        
    }
    
    public void onUpdatePostNode(NodeRef postNode, Map<QName, Serializable> before, Map<QName, Serializable> after) {
    	
    	if (privateOnly && !forumUtils.isPrivate(postNode)) return;
    	
    }
    
    public void onCreatePostNode(final ChildAssociationRef childAssocRef) {
    	
    	final NodeRef postNode = childAssocRef.getChildRef();
    	if (privateOnly && !forumUtils.isPrivate(postNode)) return;
    	
        AuthenticationUtil.runAsSystem(new RunAsWork<Void>() {
        	
            @Override
            public Void doWork() throws Exception {
                return null;
            }
            
        });
        
    }
    
    public void beforeDeletePostNode(final NodeRef nodeRef) {
    	
    	if (privateOnly && !forumUtils.isPrivate(nodeRef)) return;
    	
        AuthenticationUtil.runAsSystem(new RunAsWork<Void>() {
        	
            @Override
            public Void doWork() throws Exception {
                return null;
            }
            
        });
        
    }
    
    public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    	this.setNodeService(serviceRegistry.getNodeService());
    }

    public void setPolicyComponent(PolicyComponent policyComponent)  {
        this.policyComponent = policyComponent;
    }
    
    public void setCommentService(CommentService commentService) {
        this.commentService = commentService;
    }
    
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
        
    public void setPrivateOnly(boolean privateOnly) {
    	this.privateOnly = privateOnly;
    }

    public void setForumUtils(ForumUtils forumUtils) {
    	this.forumUtils = forumUtils;
    }
    
}
