package org.bluedolmen.alfresco.workflows.jbpm;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

import org.alfresco.repo.workflow.WorkflowNotificationUtils;
import org.alfresco.repo.workflow.jbpm.AlfrescoAssignment;
import org.alfresco.repo.workflow.jbpm.JBPMEngine;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.workflow.WorkflowException;
import org.dom4j.Attribute;
import org.dom4j.Element;
import org.jbpm.graph.exe.ExecutionContext;
import org.jbpm.taskmgmt.exe.Assignable;
import org.springframework.beans.factory.BeanFactory;

public class AssignmentHandler extends AlfrescoAssignment {

	private static final long serialVersionUID = 2023865812417159477L;
	private ServiceRegistry services;
	private WorkflowNotificationUtils workflowNotificationUtils;
    private ScriptAssignmentHelper scriptAssignmentHelper;
    
    private AuthorityService authorityService;

    private static final String ATTR_ASSIGN_FIRST_POOLED = "assignFirst";
    private Element actor;
    private Element pooledactors;


    /* (non-Javadoc)
     * @see org.alfresco.repo.workflow.jbpm.JBPMSpringActionHandler#initialiseHandler(org.springframework.beans.factory.BeanFactory)
     */
    @Override
    protected void initialiseHandler(BeanFactory factory) {
    	
        services = (ServiceRegistry) factory.getBean(ServiceRegistry.SERVICE_REGISTRY);
        workflowNotificationUtils = (WorkflowNotificationUtils)factory.getBean("workflowNotification");
        authorityService = services.getAuthorityService();
        scriptAssignmentHelper = new ScriptAssignmentHelper(services);
        
    }

    
    /* (non-Javadoc)
     * @see org.jbpm.taskmgmt.def.AssignmentHandler#assign(org.jbpm.taskmgmt.exe.Assignable, org.jbpm.graph.exe.ExecutionContext)
     */
    public void assign(Assignable assignable, ExecutionContext executionContext) throws Exception {
    	
    	if (actor == null && pooledactors == null) {
        	throw new WorkflowException("no actor or pooled actors has been specified");
        }
    	
    	if (assignable == null) {
    		throw new IllegalArgumentException("The assignable value is undefined");
    	}
    	
    	final AssignmentHelper assignmentHelper = new AssignmentHelper(executionContext);
    	assignmentHelper.assign(assignable);

    }
    
    
    private final class AssignmentHelper {
    	
        private final Boolean sendEMailNotification;
    	private final ExecutionContext executionContext;
    	
    	private Assignable assignable;
    	private String assignedActor;
    	private Set<String> assignedPooledActors;
    	
    	private AssignmentHelper(ExecutionContext executionContext) {
    		
    		if (null == executionContext) {
    			throw new IllegalArgumentException("The execution context has to be provided");
    		}
    		
    		this.executionContext = executionContext;
    		sendEMailNotification = (Boolean) executionContext.getVariable(WorkflowNotificationUtils.PROP_SEND_EMAIL_NOTIFICATIONS);
    		
    	}
    	
    	private synchronized void assign(Assignable assignable) {
    		
    		this.assignable = assignable;
    		assignedPooledActors = new LinkedHashSet<String>();
    		
            assignActor();
            assignPooledActor();
            sendEMailNotificationIfNecessary();
            
    	}
    	
    	protected void assignActor() {
    		
    		if (null == actor) return;
    		
            final String actorValStr = actor.getTextTrim();
            assignedActor = scriptAssignmentHelper.getActor(actorValStr, executionContext);
            if (null == assignedActor) return;
        	
            _assignActor(assignedActor);
            
    	}
    	
    	private void _assignActor(String actorId) {
    		
        	assignable.setActorId(actorId);
    		
    	}
    	
    	protected void assignPooledActor() {
    		
    		if (null == pooledactors) return;
    		
            final String pooledactorValStr = pooledactors.getTextTrim();
            assignedPooledActors.addAll( scriptAssignmentHelper.getPooledActors(pooledactorValStr, executionContext) );
            if (null == assignedPooledActors) return;
            
            final String[] assignedPooledActors_ = new String[assignedPooledActors.size()];
            assignedPooledActors.toArray(assignedPooledActors_);
            
			assignable.setPooledActors(assignedPooledActors_);
			
			if (assignedActor == null) {
				assignFirstPooledIfNecessary();
			}
    		
    	}
    	
    	private void assignFirstPooledIfNecessary() {
    		
    		final Attribute firstPooledAttr = pooledactors.attribute(ATTR_ASSIGN_FIRST_POOLED);
    		final String firstPooledStr = firstPooledAttr.getValue();
    		if (null == firstPooledStr || !"true".equals(firstPooledStr.toLowerCase()) ) return;
    		
    		for (final String pooledActor : assignedPooledActors) {
    			
    			final AuthorityType authorityType = AuthorityType.getAuthorityType(pooledActor);
    			String assignedActor = null;
    			
    			if (!AuthorityType.USER.equals(authorityType)) {
    				final Set<String> containedPersons = authorityService.getContainedAuthorities(AuthorityType.USER, pooledActor, false);
    				if (containedPersons.isEmpty()) continue;
    			
    				assignedActor = containedPersons.iterator().next(); 
    			} else {
    				assignedActor = pooledActor;
    			}
    			
    			if (null != assignedActor) {
    				_assignActor(assignedActor);
    				break;
    			}
    			
    		}
    		
    	}
    	
    	private void sendEMailNotificationIfNecessary() {
    		
    		if (null != assignedActor) {
    			manageEMailNotification(Collections.singleton(assignedActor));
    			return;
    		}
    		
    		manageEMailNotification(assignedPooledActors);
    		
    	}
    	
        private void manageEMailNotification(Set<String> actors) {
        	
            if (!Boolean.TRUE.equals(sendEMailNotification)) return;
            if (null == actors) return;
            
            final String[] emailedActors = new String[actors.size()];
            actors.toArray(emailedActors);
            
    		// Send the notification
    		workflowNotificationUtils.sendWorkflowAssignedNotificationEMail(
    				JBPMEngine.ENGINE_ID + "$" + executionContext.getTaskInstance().getId(),
    				null /* taskType */,
    				emailedActors,
    				true
    		);
        	
        }
    	
    }

    

}
