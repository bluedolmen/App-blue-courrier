/*
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */
package org.bluedolmen.repo.jscript;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

import org.alfresco.repo.policy.BaseBehaviour;
import org.alfresco.repo.policy.PolicyException;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ScriptLocation;
import org.alfresco.service.cmr.repository.ScriptService;
import org.springframework.extensions.surf.util.ParameterCheck;


/**
 * JavaScript behaviour implementation.
 * 
 * This class has to be modified in order to use a Behaviour which uses a
 * converter that is able to convert correctly a HashMap of properties. HashMap
 * are notably used when using a behaviour of kind "onUpdateProperties".
 * 
 * This is a known bug on versions of Alfresco greater than 3.4.6 and still
 * exists in versions earlier to 4.2.c.
 * 
 * Also, we extend it in order to provide a runAs option which enables the
 * behaviour to be executed as an admin user.
 * 
 * @see https://issues.alfresco.com/jira/browse/ALF-7506
 * @see https://issues.alfresco.com/jira/browse/ALF-20129 
 * 
 * @author Roy Wetherall
 * @author Brice Pajot
 */
public class ScriptBehaviour extends BaseBehaviour
{	
	
	public ScriptBehaviour() {
		super();
	}
	
    public ScriptBehaviour(NotificationFrequency frequency) {
    	super(frequency);
    }
    
    @SuppressWarnings("unchecked")
	public synchronized <T> T getInterface(Class<T> policy) 
	{
	    ParameterCheck.mandatory("Policy class", policy);
	    Object proxy = proxies.get(policy);
	    
	    if (proxy == null) {
	    	
	    	final Method[] policyIFMethods = policy.getMethods();
	        if (policyIFMethods.length != 1) {
	            throw new PolicyException("Policy interface " + policy.getCanonicalName() + " must have only one method");
	        }
	        
	        final InvocationHandler handler = createInvocationHandler();
	        proxy = Proxy.newProxyInstance(policy.getClassLoader(), new Class[]{policy}, handler);
	        proxies.put(policy, proxy);
	        
	    }
	    
	    return (T) proxy;
	    
	}  
    
    protected InvocationHandler createInvocationHandler() {
    	
    	return new JavaScriptInvocationHandler(this) {
    		@Override
    		protected Map<String, Object> createModel() {
    			final Map<String, Object> model = super.createModel();
    			if (null != extraModel) {
    				model.putAll(extraModel);
    			}
    			return model;
    		}
    	};
    	
    }
    
    /**
     * JavaScript Invocation Handler
     * 
     * Extended to be run as an admin user
     * Changed to protected to enable overriding by potential subclasses
     * 
     * @author Roy Wetherall
     * @author Brice Pajot
     */
    protected static class JavaScriptInvocationHandler implements InvocationHandler {
    	
        private ScriptBehaviour behaviour;
        
        private JavaScriptInvocationHandler(ScriptBehaviour behaviour) {
            this.behaviour = behaviour;
        }

        /**
         * @see java.lang.reflect.InvocationHandler#invoke(java.lang.Object, java.lang.reflect.Method, java.lang.Object[])
         */
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        	
            // Handle Object level methods
            if (method.getName().equals("toString")) {
                return toString();
            }
            else if (method.getName().equals("hashCode")) {
                return hashCode();
            }
            else if (method.getName().equals("equals")) {
            	
                if (Proxy.isProxyClass(args[0].getClass())) {
                    return equals(Proxy.getInvocationHandler(args[0]));
                }
                
                return false;
                
            }
            
            // Delegate to designated method pointer
            if (behaviour.isEnabled()) {
            	
                try {
                    behaviour.disable();
                    return invokeScript(method, args);
                }
                finally {
                    behaviour.enable();
                }
                
            }
            
            return null;
            
        }

        protected Object invokeScript(Method method, Object[] args) {
        	
        	// Build the model
        	final Map<String, Object> model = createModel();
        	model.put("behaviour", new org.bluedolmen.repo.jscript.Behaviour(this.behaviour.serviceRegistry, method.getName(), args));
        	
        	final ScriptService scriptService = this.behaviour.serviceRegistry.getScriptService();
        	final ScriptLocation location = this.behaviour.location;
        	final String runAsUser = null == this.behaviour.runAs ? AuthenticationUtil.getFullyAuthenticatedUser() : this.behaviour.runAs; 
        	
        	return AuthenticationUtil.runAs(new RunAsWork<Object>() {

				@Override
				public Object doWork() throws Exception {
					return scriptService.executeScript(location, model);
				}
        		
			}, runAsUser);
        	
		}
        
        protected Map<String, Object> createModel() {
        	
        	final Map<String, Object> model = new HashMap<String, Object>(1);
        	return model;
        	
        }
        
		@Override
        public boolean equals(Object obj) {
			
            if (obj == this) {
                return true;
            }
            else if (obj == null || !(obj instanceof JavaScriptInvocationHandler)) {
                return false;
            }
            
            final JavaScriptInvocationHandler other = (JavaScriptInvocationHandler) obj;
            return  behaviour.location.equals(other.behaviour.location);
            
        }

        @Override
        public int hashCode() {
            return 37 * behaviour.location.hashCode();
        }

        @Override
        public String toString() {
            return "JavaScriptBehaviour[ location = '" + behaviour.location.toString() + "' ]";
        }
        
    }
    
    
    // IoC
    
	private ServiceRegistry serviceRegistry;
	private ScriptLocation location;
	private String runAs;
	private Map<String, Object> extraModel;
    
    public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		this.serviceRegistry = serviceRegistry;
	}
    
    public void setLocation(ScriptLocation location) {
		this.location = location;
	}

    public void setRunAs(String runAs) {
    	this.runAs = runAs;
    }
    
    public void setExtraModel(Map<String, Object> model) {
    	this.extraModel = model;
    }
}
