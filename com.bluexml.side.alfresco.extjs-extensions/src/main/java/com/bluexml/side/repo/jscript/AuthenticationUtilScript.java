package com.bluexml.side.repo.jscript;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.security.authentication.AuthenticationUtil;

public final class AuthenticationUtilScript extends BaseScopableProcessorExtension {
	
	public String getFullyAuthenticatedUser() {
		return AuthenticationUtil.getFullyAuthenticatedUser();
	}
	
	
}
