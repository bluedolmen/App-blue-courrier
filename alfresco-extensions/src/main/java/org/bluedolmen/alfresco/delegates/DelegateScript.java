package org.bluedolmen.alfresco.delegates;

import java.util.Date;
import java.util.Set;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.service.cmr.security.AuthorityType;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

public final class DelegateScript extends BaseScopableProcessorExtension {
	
	public void addDelegate(String authorityName, String delegateAuthorityName) {
		delegateService.addDelegate(authorityName, delegateAuthorityName);
	}


	public void addDelegate(String authorityName, String delegateAuthorityName, Date fromDate, boolean isDefaultAssignee) {
		delegateService.addDelegate(authorityName, new Delegate(delegateAuthorityName, fromDate, isDefaultAssignee) );
	}


	public void removeDelegate(String authorityName, String delegateAuthorityName) {
		delegateService.removeDelegate(authorityName, delegateAuthorityName);
		
	}


	public Scriptable getDelegatedPersons(String authorityName) {
		
		final Set<Delegate> delegates = delegateService.getDelegatedPersons(authorityName);
		
    	return Context.getCurrentContext().newArray(
    			getScope(), 
    			delegates.toArray()
    	);
    	
	}
	
	public Scriptable getDirectDelegates(String authorityName) {
		
		final Set<Delegate> delegates = delegateService.getDelegates(authorityName, AuthorityType.GROUP, true);
		
    	return Context.getCurrentContext().newArray(
    			getScope(), 
    			delegates.toArray()
    	);
		
	}
	
	public boolean isDelegate(String authorityName, String delegateAuthorityName) {
		return delegateService.isDelegate(authorityName, delegateAuthorityName);
	}

	
	// IoC

	private DelegateService delegateService;

	public void setDelegateService(DelegateService delegateService) {
		this.delegateService = delegateService;
	}

	
}
