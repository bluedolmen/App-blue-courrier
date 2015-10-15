package org.bluedolmen.repo.jscript;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;



public final class AuthenticationUtilScript extends BaseScopableProcessorExtension {
	
	public String getFullyAuthenticatedUser() {
		return AuthenticationUtil.getFullyAuthenticatedUser();
	}
	
    /**
    * This method runs javascript function with Admin privileges
    * @param func
    *
    */
    public Object runAsAdmin(final Function func) {
    	
    	return runAs(AuthenticationUtil.getSystemUserName(), func);
    	
    }

    /**
    * This method runs javascript function with Admin privileges
    * @param func
    *
    */
    public Object runAs(final String userName, final Function func) {
    	
    	throw new UnsupportedOperationException("This method has been deprecated. Use secure methods instead.");
    	
//    	if (null == userName) {
//    		throw new IllegalArgumentException("The user-name is not valid (null)");
//    	}
//    	
//        final Context cx = Context.getCurrentContext();
//        final Scriptable scope = getScope();
//        
//        final RunAsWork<?> raw = new RunAsWork<Object>() {
//        	
//            public Object doWork() throws Exception {
//                return func.call(cx, scope, scope, new Object[] {});
//            }
//            
//        };
//        
//        return AuthenticationUtil.runAs(raw, userName);
        
    }

}
