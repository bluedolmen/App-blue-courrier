package org.bluedolmen.alfresco.delegates;

import java.util.Set;

import org.alfresco.service.cmr.security.AuthorityType;

public interface DelegateService {

	void addDelegate(String authorityName, String delegateAuthorityName);
	
	void addDelegate(String authorityName, Delegate delegate);
	
	void removeDelegate(String authorityName, String delegateAuthorityName);

	Set<Delegate> getDelegates(String authorityName, AuthorityType authorityType, boolean immediate);
	
	Set<Delegate> getDelegatedPersons(String userName);
	
	boolean isDelegate(String authorityName, String delegateAuthorityName);
	
}
