package org.bluedolmen.alfresco.webscripts;

import java.util.Map;

import org.alfresco.repo.security.permissions.AccessDeniedException;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

public class ExtraAuthenticatedDeclarativeWebscript extends DeclarativeWebScript {
	
	public static interface ExtraAuthenticatedDelegate {
	
		boolean hasAccess();
		
		void checkAuthentication() throws AccessDeniedException;
		
	}

	@Override
	protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
		
		if (null != extraAuthenticatedDelegate) {
			extraAuthenticatedDelegate.checkAuthentication();
		}
		
		return super.executeImpl(req, status, cache);
		
	}
	
	private ExtraAuthenticatedDelegate extraAuthenticatedDelegate;
	
	public void setExtraAuthenticatedDelegate(ExtraAuthenticatedDelegate extraAuthenticatedDelegate) {
		this.extraAuthenticatedDelegate = extraAuthenticatedDelegate;
	}
	
}
