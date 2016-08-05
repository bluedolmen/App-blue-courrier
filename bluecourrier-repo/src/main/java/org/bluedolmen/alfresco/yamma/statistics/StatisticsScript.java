package org.bluedolmen.alfresco.yamma.statistics;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.alfresco.repo.domain.node.NodeDAO;
import org.alfresco.repo.domain.node.NodeDAO.NodeRefQueryCallback;
import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ValueConverter;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.util.Pair;
import org.bluedolmen.alfresco.yamma.BlueCourrierModel;
import org.mozilla.javascript.Scriptable;

public final class StatisticsScript extends BaseScopableProcessorExtension {

	private NodeDAO nodeDAO;
	private AuthorityService authorityService;
	private ServiceRegistry serviceRegistry;
	private List<String> authorizedUserNames = Collections.emptyList();
	private final ValueConverter valueConverter = new ValueConverter();
	
	public Scriptable getDocumentNodes() {
		return getDocumentNodes(null);
	}
	
	Scriptable getDocumentNodes(final Long limit) {
		
		final String currentUserName = AuthenticationUtil.getFullyAuthenticatedUser();
		if (!authorityService.isAdminAuthority(currentUserName) && !authorizedUserNames.contains(currentUserName)) {
			throw new IllegalAccessError("Listing the documents is only allowed to admin and authorized users");
		}
		
		final List<NodeRef> result = new ArrayList<NodeRef>(100);
		
		final NodeRefQueryCallback callback = new NodeRefQueryCallback() {
			
			public boolean handle(Pair<Long, NodeRef> nodePair) {
				
				final NodeRef nodeRef = nodePair.getSecond();
				
				// Only keep the nodes in the Workspace
				if (StoreRef.STORE_REF_WORKSPACE_SPACESSTORE.equals(nodeRef.getStoreRef())) {
					result.add(nodeRef);					
				}

				return (limit == null || result.size() < limit);
				
			}
			
		};
		
		nodeDAO.getNodesWithAspects(Collections.singleton(BlueCourrierModel.ASPECT_DOCUMENT), 0L, Long.MAX_VALUE, callback);
		
		return (Scriptable) valueConverter.convertValueForScript(serviceRegistry, getScope(), null, (Serializable) result);
		
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
	
	public void setNodeDAO(NodeDAO nodeDAO) {
		this.nodeDAO = nodeDAO;
	}
	
	public void setAuthorityService(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}
	
	public void setAuthorizedUserNames(List<String> authoritzedUserNames) {
		this.authorizedUserNames = authoritzedUserNames;
	}
	
}
