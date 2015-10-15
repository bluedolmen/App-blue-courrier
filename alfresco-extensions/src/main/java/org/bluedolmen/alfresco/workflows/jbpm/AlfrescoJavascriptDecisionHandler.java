package org.bluedolmen.alfresco.workflows.jbpm;


import java.util.Iterator;
import java.util.List;

import org.alfresco.repo.model.Repository;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.workflow.WorkflowException;
import org.dom4j.Element;
import org.jbpm.context.def.VariableAccess;
import org.jbpm.graph.exe.ExecutionContext;
import org.jbpm.jpdl.xml.JpdlXmlReader;
import org.jbpm.taskmgmt.exe.TaskInstance;
import org.springframework.beans.factory.BeanFactory;
import org.xml.sax.InputSource;

/**
 * A JBPM Decision Handler for executing Alfresco Script
 *
 * The configuration of this action is as follows:
 *  <script>
 *     <expression>
 *        the script to execute; this script must return a valid string, indicating the transition to be taken
 *     </expression>
 *  </script>
 *  
 * It's exactly the same as jBPM's own script configuration.
 * 
 * The code is essentially a copy/paste of the JBPMSpringActionHandler from Alfresco: due to the private nature of
 * the methods, we cannot easily reuse the material developed by Alfresco, hence the copy (that material should
 * probably be defined in an auxiliary class to be used by composition patterns.
 *  
 * @author bpajot
 */
public class AlfrescoJavascriptDecisionHandler extends JBPMSpringDecisionHandler  {

    
    /**
	 * 
	 */
	private static final long serialVersionUID = -2257118983589744905L;
	private static JpdlXmlReader jpdlReader = new JpdlXmlReader((InputSource)null);
	
    private ServiceRegistry services;
    private NodeRef companyHome;
    private Element script;
    private String runas;
    
    /**
     * {@inheritDoc}
     */
    @Override
    protected void initialiseHandler(BeanFactory factory) {
        this.services = (ServiceRegistry)factory.getBean(ServiceRegistry.SERVICE_REGISTRY);
        final Repository repositoryHelper = (Repository)factory.getBean("repositoryHelper");
        this.companyHome = repositoryHelper.getCompanyHome();
    }
    
	@Override
	public String decide(ExecutionContext executionContext) throws Exception {
		
        // validate script
        if (script == null) {
            throw new WorkflowException("Script has not been provided");
        }
        
        boolean isTextOnly = isScriptOnlyText();
        
        final List<VariableAccess> variableAccesses = getVariableAccessors(isTextOnly);
        final String expression = getExpression(isTextOnly);

        // execute
        final Object result = executeExpression(expression, executionContext, variableAccesses);
        if (null == result) return null;
        
        if (!(result instanceof String)) {
        	throw new WorkflowException("The result of the decision-handler has to be a valid string");
        }
        
        return (String) result;
        
	}


    private Object executeExpression(String expression, ExecutionContext executionContext, List<VariableAccess> variableAccesses)  {
    	
        final boolean userChanged = checkFullyAuthenticatedUser(executionContext);
        final Object result = executeScript(expression, executionContext, variableAccesses);
        
        if(userChanged) {
            AuthenticationUtil.clearCurrentSecurityContext();
        }
        
        return result;
        
    }

    private Object executeScript(String expression,
                ExecutionContext executionContext,
                List<VariableAccess> variableAccesses) 
    {
        
    	final String user = AuthenticationUtil.getFullyAuthenticatedUser();
        if (runas == null && user !=null) {
             return executeScript(executionContext, services, expression, variableAccesses, companyHome);
        }
        else {
        	
            String runAsUser = runas;
            if(runAsUser == null) {
                runAsUser = AuthenticationUtil.getSystemUserName();
            } 
            else {
                validateRunAsUser();
            }
            
            return executeScriptAs(runAsUser, expression, executionContext, variableAccesses);
            
        }
        
    }

    private Object executeScriptAs(String runAsUser,
                final String expression,
                final ExecutionContext executionContext,
                final List<VariableAccess> variableAccesses) 
    {
        // execute as specified runAsUser
        return AuthenticationUtil.runAs(
        	new AuthenticationUtil.RunAsWork<Object>() {
	            public Object doWork() throws Exception {
	                return executeScript(executionContext, services, expression, variableAccesses, companyHome);
	            }
	        }, 
	        runAsUser
	    );
    }

    /**
     * Checks a valid Fully Authenticated User is set.
     * If none is set then attempts to set the task assignee as the Fully Authenticated User.
     * @param executionContext
     * @return <code>true</code> if the Fully Authenticated User was changes, otherwise <code>false</code>.
     */
    private boolean checkFullyAuthenticatedUser(final ExecutionContext executionContext)  {
    	
        if(AuthenticationUtil.getFullyAuthenticatedUser()!= null) return false;
        
        final TaskInstance taskInstance = executionContext.getTaskInstance();
        if(taskInstance != null) {
            final String userName = taskInstance.getActorId();
            if (userName != null) {
                AuthenticationUtil.setFullyAuthenticatedUser(userName);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Checks that the specified 'runas' field
     * specifies a valid username.
     */
    private void validateRunAsUser() {
    	
        final Boolean runAsExists = AuthenticationUtil.runAs(
        	new RunAsWork<Boolean>() {
	            // Validate using System user to ensure sufficient permissions available to access person node.
	        
	            public Boolean doWork() throws Exception {
	                return services.getPersonService().personExists(runas);
	            }
	        }, 
	        AuthenticationUtil.getSystemUserName()
	    );
        
        if (!runAsExists) {
            throw new WorkflowException("runas user '" + runas + "' does not exist.");
        }
        
    }

    /**
     * Gets the expression {@link String} from the script.
     * @param isTextOnly Is the script text only or is it XML?
     * @return the expression {@link String}.
     */
    private String getExpression(boolean isTextOnly) {
    	
        if (isTextOnly) {
            return script.getText().trim();
        }
        else {
        	
            final Element expressionElement = script.element("expression");
            if (expressionElement == null) {
                throw new WorkflowException("Script expression has not been provided");
            }
            
            return expressionElement.getText().trim();
            
        }
    }

    @SuppressWarnings("unchecked")
    private List<VariableAccess> getVariableAccessors(boolean isTextOnly) {
    	
        if (isTextOnly) {
            return null;
        }
        else {
            return jpdlReader.readVariableAccesses(script);
        }
        
    }

    /**
     * Is the script specified as text only, or as explicit expression, variable elements
     * @return
     */
    @SuppressWarnings("unchecked")
    private boolean isScriptOnlyText() {

    	final Iterator<Element> iter = script.elementIterator();
        while (iter.hasNext()) {
        	
           final Element element = iter.next();
           if (element.getNodeType() == org.dom4j.Node.ELEMENT_NODE) {
              return false;
           }
           
        }
        
        return true;
        
    }

    public void setScript(Element script) {
        this.script = script;
        super.setScript(script);
    }
    
    public void setRunas(String runas) {
        this.runas = runas;
        super.setRunas(runas);
    }

}
