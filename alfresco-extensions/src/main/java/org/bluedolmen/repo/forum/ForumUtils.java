package org.bluedolmen.repo.forum;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.model.ForumModel;
import org.alfresco.repo.policy.BehaviourFilter;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AccessPermission;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.OwnableService;
import org.alfresco.service.cmr.security.PermissionService;

public class ForumUtils {
	
	private static final String COMMENT_ACCESS_PERMISSION = PermissionService.CONSUMER;
	
	private PermissionService permissionService = null;
	private NodeService nodeService = null;
	private OwnableService ownableService = null;
	private BehaviourFilter behaviourFilter = null;
	
	public void setCommentAsPrivate(final NodeRef commentNodeRef, final String[] privateAuthorities) {
		
		checkPostNode(commentNodeRef);
		
		// We do not want this to be saved as a modification on the node
        behaviourFilter.disableBehaviour(commentNodeRef, ContentModel.ASPECT_AUDITABLE);
        
        try {
        	
        	if (isPrivate(commentNodeRef)) {
        		
				/*
				 * Already private, we check if some previously set allowed
				 * authorities are not removed in order to remove them if
				 * necessary
				 */
        		removeNonDeclaredAuthorities(commentNodeRef, privateAuthorities);
        		
        	}
        	
        	permissionService.setInheritParentPermissions(commentNodeRef, privateAuthorities.length == 0);
        	
        	for (final String authorityId : privateAuthorities) {
        		permissionService.setPermission(commentNodeRef, authorityId, COMMENT_ACCESS_PERMISSION, true);
        	}
        	
        }
        finally {
        	behaviourFilter.enableBehaviour(commentNodeRef, ContentModel.ASPECT_AUDITABLE);
        }
		
	}
	
	private void checkPostNode(final NodeRef commentNodeRef) {
		
		if ( !isPostNode(commentNodeRef) ) {
			throw new AlfrescoRuntimeException("The provided node has to be a node of type " + ForumModel.TYPE_POST.getLocalName());
		}
		
	}
	
	private void removeNonDeclaredAuthorities(final NodeRef commentNodeRef, final String[] privateAuthorities) {
		
		final Set<String> privateAuthorities_ = new HashSet<String>(Arrays.asList(privateAuthorities));
		final List<String> declaredAuthorities = getPrivateDeclaredAuthorities(commentNodeRef);
		
		for (final String authority : declaredAuthorities) {
			
			if (privateAuthorities_.contains(authority) ) continue;
			
			// This has to be removed
			permissionService.deletePermission(commentNodeRef, authority, COMMENT_ACCESS_PERMISSION);
			
		}
		
	}
	
	public List<String> getPrivateDeclaredAuthorities(final NodeRef commentNodeRef) {
		
		if (!AccessStatus.ALLOWED.equals(permissionService.hasPermission(commentNodeRef, PermissionService.READ)) ) {
			throw new AccessDeniedException(commentNodeRef.toString());
		}
		
		final Set<String> declaredAuthorities = new HashSet<String>();
		
		AuthenticationUtil.runAsSystem(new RunAsWork<Void>() {

			@Override
			public Void doWork() throws Exception {
				
		    	final Set<AccessPermission> permissions = permissionService.getAllSetPermissions(commentNodeRef);
				for (final AccessPermission accessPermission : permissions) {
					
					if (!accessPermission.isSetDirectly()) continue;
					if (!AccessStatus.ALLOWED.equals(accessPermission.getAccessStatus())) continue;
					if (!COMMENT_ACCESS_PERMISSION.equals(accessPermission.getPermission())) continue;
					
					final String authority = accessPermission.getAuthority();
					declaredAuthorities.add(authority);
					
				}
				
				return null;
			}
			
		});

		// Also add the owner of the document
		final String owner = ownableService.getOwner(commentNodeRef);
		declaredAuthorities.add(owner);
		
		return new ArrayList<String>(declaredAuthorities);
		
	}
	
	public boolean isPostNode(final NodeRef commentNodeRef) {
		
		return ForumModel.TYPE_POST.equals(nodeService.getType(commentNodeRef));
		
	}
	
	public boolean isPrivate(final NodeRef commentNodeRef) {
		
		return false == permissionService.getInheritParentPermissions(commentNodeRef);
		
	}
	
	
	public void setPermissionService(PermissionService permissionService) {
		this.permissionService = permissionService;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setOwnableService(OwnableService ownableService) {
		this.ownableService = ownableService;
	}
	
	public void setServiceRegistry(ServiceRegistry services) {
		this.setPermissionService(services.getPermissionService());
		this.setNodeService(services.getNodeService());
		this.setOwnableService(services.getOwnableService());
	}
	
	public void setBehaviourFilter(BehaviourFilter behaviourFilter) {
		this.behaviourFilter = behaviourFilter;
	}
    
}
