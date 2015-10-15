package org.bluedolmen.alfresco.webscripts;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.security.AuthorityService;
import org.apache.commons.lang.StringUtils;
import org.bluedolmen.alfresco.webscripts.ExtraAuthenticatedDeclarativeWebscript.ExtraAuthenticatedDelegate;

public class GroupAuthenticatedDelegate implements ExtraAuthenticatedDelegate {
	
	@Override
	public boolean hasAccess() {
		
		if (null == this.groups || this.groups.isEmpty()) return true;
		
		final String fullyAuthenticationUser = AuthenticationUtil.getFullyAuthenticatedUser();
		final Set<String> authorities = authorityService.getAuthoritiesForUser(fullyAuthenticationUser);
		
		for (final String group : this.groups) {
			if (authorities.contains(group)) return true;
		}
		
		return false;
		
	}
	
	@Override
	public void checkAuthentication() throws AccessDeniedException {
		
		if (!hasAccess()) {
			throw new AccessDeniedException(String.format("Web Script requires you to belong to groups: %s", getGroupListAsString()));
		}
		
	}
	
	private String getGroupListAsString() {
		
		if (null == groups || groups.isEmpty()) return "";
		
		return StringUtils.join(groups.toArray(), ",");
		
	}

	private AuthorityService authorityService;
	private List<String> groups;
	
	public void setGroups(List<String> groups) {
		this.groups = groups;
	}
	
	public void setGroup(String group) {
		this.setGroups(Collections.singletonList(group));
	}
	
	public void setAuthorityService(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.setAuthorityService(serviceRegistry.getAuthorityService());
	}

	
}
