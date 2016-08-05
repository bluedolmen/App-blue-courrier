package org.bluedolmen.alfresco.yamma;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.repo.transaction.AlfrescoTransactionSupport;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.workflow.WorkflowDefinition;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public class YammaHelperScript extends BaseScopableProcessorExtension {

	private static final String TRANSACTIONAL_SHARES_KEY = "bcinwf:shares";
	private static final String TRANSACTIONAL_INPARAMETERS_KEY = "bcinwf:parameters";
	private static final Log logger = LogFactory.getLog(YammaHelperScript.class);
	
	private ServiceRegistry serviceRegistry;
	private SiteService siteService;
	private NodeService nodeService;
	private AuthorityService authorityService;
	private AuthenticationService authenticationService;
	private WorkflowService workflowService;
	private String adminisitratorsGroupName = "ALFRESCO_ADMINISTRATORS";
	
	private List<String> cleanedUpWorkflows = Collections.emptyList();
	
	private FollowingUtils followingUtils;

	/**
	 * Helper method to determine if a given shortName is a service-name. This
	 * may be used by people who have not normal accesses to the site-node.
	 * 
	 * @param serviceName
	 * @return
	 */
	public boolean isService(final String serviceName) {
		
		if (StringUtils.isBlank(serviceName)) return false;
		
        final RunAsWork<Boolean> runAsWork = new RunAsWork<Boolean>() {
        	
            public Boolean doWork() throws Exception {
            	final SiteInfo siteInfo = siteService.getSite(serviceName);
            	if (null == siteInfo) return false;
            	
            	final NodeRef siteNode = siteInfo.getNodeRef();
            	if (null == siteNode) return false;
            	
            	return nodeService.hasAspect(siteNode, BlueCourrierModel.ASPECT_SERVICE);
            }
            
        };
        		
		return AuthenticationUtil.runAs(runAsWork, AuthenticationUtil.getAdminUserName());	
		
	}
	
	/**
	 * This script remove unconditionally the invalid pending workflows, that
	 * is, those for which the associated document does not exist anymore as a
	 * package resource.
	 */
	public void cleanUpInvalidPendingWorkflows() {
		
		final String currentUserName = authenticationService.getCurrentUserName();
		if (!authorityService.isAdminAuthority(currentUserName)) {
			throw new AccessDeniedException("You have to be an admin user to perform this operation");
		}
		
		for (final String workflowId : cleanedUpWorkflows) {
			cleanUpWorkflow(workflowId);
		}
		
	}
	
	public void setContextualIncomingParameters(Object parameters) {
		
		AlfrescoTransactionSupport.bindResource(TRANSACTIONAL_INPARAMETERS_KEY, parameters);
		
	}

	public Object getContextualIncomingParameters() {
		
		return AlfrescoTransactionSupport.getResource(TRANSACTIONAL_INPARAMETERS_KEY);
		
	}

	public void setContextualShares(String shares) {
		
		AlfrescoTransactionSupport.bindResource(TRANSACTIONAL_SHARES_KEY, shares);
		
	}
	
	public String getContextualShares() {
		
		return (String) AlfrescoTransactionSupport.getResource(TRANSACTIONAL_SHARES_KEY);
		
	}
	
	private void cleanUpWorkflow(String workflowId) {
		
		final List<WorkflowDefinition> defs = workflowService.getAllDefinitionsByName(workflowId);
		
		if (null == defs) {
			logger.warn(String.format("Cannot find a definition for workflow '%s'", workflowId));
			return;
		}
		
		for (WorkflowDefinition def : defs) {
			
			final List<WorkflowInstance> workflowInstances = workflowService.getActiveWorkflows(def.getId());
			for (WorkflowInstance workflowInstance : workflowInstances) {
				
				if (!isWorklfowInstanceBroken(workflowInstance)) continue;
				
				logger.info(String.format("Cancelling workflow '%s' (%s)", workflowInstance.getId(), workflowInstance.getDescription()));
				workflowService.deleteWorkflow(workflowInstance.getId());
				
			}
			
		}
		
		
	}
	
	private boolean isWorklfowInstanceBroken(WorkflowInstance workflowInstance) {
		
		final NodeRef workflowPackage = workflowInstance.getWorkflowPackage();
		
		if (null == workflowPackage) return true;
		if (!nodeService.exists(workflowPackage)) return true;
		
		final List<NodeRef> packageContents = workflowService.getPackageContents(workflowPackage);
		if (packageContents.isEmpty()) return true;
		
		// Only focus on first-package resource
		final NodeRef firstPackageResource = packageContents.get(0);
		if (!nodeService.exists(firstPackageResource)) return true;
		
		return false;
		
	}
	
	public Scriptable queryFollowing(String userName) {
		
		final List<NodeRef> nodes = followingUtils.queryFollowing(userName);
		final Object[] result = new Object[nodes.size()];
		
		for (int i = 0, len = nodes.size(); i < len; i++) {
			result[i] = new ScriptNode(nodes.get(i), serviceRegistry, this.getScope());
		}
		
		return Context.getCurrentContext().newArray(getScope(), result);
		
	}
	
	/**
	 * Whether the provided user-name is an application administrator
	 * 
	 * @param userName
	 * @return
	 */
	public boolean isApplicationAdministrator(String userName) {
		
		if (authorityService.isAdminAuthority(userName)) return true;
		
		final Set<String> containedAuthorities = authorityService.getContainedAuthorities(AuthorityType.USER, adminisitratorsGroupName, false /* immediate */);
		return containedAuthorities.contains(userName);
		
	}
	
	public void setAdministratorsGroupName(String groupName) {
		this.adminisitratorsGroupName = groupName;
	}
	
	public void setSiteService(SiteService siteService) {
		this.siteService = siteService;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setAuthorityService(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}
	
	public void setAuthenticationService(AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}
	
	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}
	
	public void setCleanedUpWorkflows(List<String> cleanedUpWorkflows) {
		this.cleanedUpWorkflows = cleanedUpWorkflows;
	}
	
	public void setFollowingUtils(FollowingUtils followingUtils) {
		this.followingUtils = followingUtils;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
		setSiteService(serviceRegistry.getSiteService());
		setNodeService(serviceRegistry.getNodeService());
		setAuthenticationService(serviceRegistry.getAuthenticationService());
		setAuthorityService(serviceRegistry.getAuthorityService());
		setWorkflowService(serviceRegistry.getWorkflowService());
	}
	
}
