package org.bluedolmen.alfresco.workflows.jbpm;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.cache.SimpleCache;
import org.alfresco.repo.dictionary.constraint.ListOfValuesConstraint;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.workflow.WorkflowModel;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.dictionary.Constraint;
import org.alfresco.service.cmr.dictionary.ConstraintDefinition;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.dictionary.PropertyDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.security.AuthorityService;
import org.alfresco.service.cmr.security.AuthorityType;
import org.alfresco.service.cmr.workflow.WorkflowDefinition;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowNode;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.service.cmr.workflow.WorkflowTask;
import org.alfresco.service.cmr.workflow.WorkflowTaskQuery;
import org.alfresco.service.cmr.workflow.WorkflowTaskQuery.OrderBy;
import org.alfresco.service.cmr.workflow.WorkflowTaskState;
import org.alfresco.service.cmr.workflow.WorkflowTransition;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public final class WorkflowUtils {
	
	private static Log logger = LogFactory.getLog(WorkflowUtils.class);
	private SimpleCache<String, Map<String, String>> transitionsCache; 
	
	List<ReassignCredentialTester> reassignCredentialTesters = new ArrayList<ReassignCredentialTester>();
	
	/**
	 * Is the provided user allowed to perform the operation of reassignment?
	 * 
	 * @param taskId the task-id to check on a particular task-id
	 * @param userName a valid user-name of null for the current logged user
	 */
	public boolean canReassign(String taskId, String userName) {
		
		if (authenticationService.isCurrentUserTheSystemUser()) return true;
		
		if (null == userName) {
			userName = authenticationService.getCurrentUserName();
		}
		
		for (final ReassignCredentialTester tester : reassignCredentialTesters) {
			if (tester.canReassign(taskId, userName)) return true;
		}
		
		return false;
		
	}
	
    public String getAssigned(String taskId) {
    	
		final WorkflowTask workflowTask = workflowService.getTaskById(taskId);
		final String currentOwner = (String) workflowTask.getProperties().get(ContentModel.PROP_OWNER);
    	
		return currentOwner;
		
    }	
	
	@SuppressWarnings("unchecked")
	public Set<String> getPooledActors(String taskId) {
		
		final WorkflowTask workflowTask = workflowService.getTaskById(taskId);
		final Map<QName, Serializable> properties = workflowTask.getProperties();
		
		final List<NodeRef> pooledActors = (List<NodeRef>) properties.get(WorkflowModel.ASSOC_POOLED_ACTORS);
		if (null == pooledActors) return Collections.emptySet();
		
		final Set<String> result = new HashSet<String>();
		for (final NodeRef pooledActorRef : pooledActors) {
			
			final QName pooledActorType = nodeService.getType(pooledActorRef);
			if (ContentModel.TYPE_PERSON.equals(pooledActorType)) {
				final String userName = (String) nodeService.getProperty(pooledActorRef, ContentModel.PROP_USERNAME);
				result.add(userName);
				continue;
			}
			
			final String authorityName = (String) nodeService.getProperty(pooledActorRef, ContentModel.PROP_AUTHORITY_NAME);
			if (null == authorityName) continue;
			
			result.addAll(authorityService.getContainedAuthorities(AuthorityType.USER, authorityName, false));
		}
		
		return result;
		
	}
	
	public void reassign(String taskId, String userName) {

		claimTask(taskId, userName, true /* force */);
		
	}
	
	public void claimTask(String taskId, String userName, boolean force) {
		
		final WorkflowTask workflowTask = workflowService.getTaskById(taskId);
		
		if (null == userName) {
			userName = authenticationService.getCurrentUserName();
		}
		
		if (!force && !workflowService.isTaskClaimable(workflowTask, userName)) {
			return;
		}
		
		final String currentOwner = (String) workflowTask.getProperties().get(ContentModel.PROP_OWNER);
		if (logger.isDebugEnabled()) {
			if (null != currentOwner && !currentOwner.isEmpty() && !currentOwner.equals(userName)) {
				logger.debug(String.format("Task %s is already assigned to user '%s'; forcing reassignment to user '%s'", taskId, userName, currentOwner));
			}
		}
		
        final Map<QName, Serializable> properties = new HashMap<QName, Serializable>(8);
        properties.put(ContentModel.PROP_OWNER, userName);
        workflowService.updateTask(taskId, properties, null, null);
		
	}
	
	public void releaseTask(String taskId, boolean force) {
		
		final WorkflowTask workflowTask = workflowService.getTaskById(taskId);
		final String currentUserName = authenticationService.getCurrentUserName();
		
		if (!force && !workflowService.isTaskReleasable(workflowTask, currentUserName) ) {
			return;
		}
		
		final String currentOwner = (String) workflowTask.getProperties().get(ContentModel.PROP_OWNER);
		if (null == currentOwner) return;
		
        final Map<QName, Serializable> properties = new HashMap<QName, Serializable>(8);
        properties.put(ContentModel.PROP_OWNER, null);
        workflowService.updateTask(taskId, properties, null, null);
		
	}
	
	public List<WorkflowTask> getActiveTasksForNode(NodeRef nodeRef, Collection<String> workflowFilters, Collection<String> taskFilters) {
		
        final List<WorkflowInstance> workflowInstances = workflowService.getWorkflowsForContent(nodeRef, true /* active */);
        final List<WorkflowTask> workflowTasks = new ArrayList<WorkflowTask>();
        
        for (final WorkflowInstance workflowInstance : workflowInstances) {
        	
        	final WorkflowDefinition workflowDefinition =  workflowInstance.getDefinition();
        	if (null == workflowDefinition) continue;
        	
        	if (null != workflowFilters && !workflowFilters.contains(workflowDefinition.getName())) continue;
        	
            final List<WorkflowTask> workflowTasks_ = getWorkflowTasks(workflowInstance);
            if (null == workflowTasks_) continue;
            
            if (null == taskFilters) {
            	workflowTasks.addAll(workflowTasks_);
            }
            else {
            	for (WorkflowTask workflowTask : workflowTasks_) {
            		
            		if (!taskFilters.contains(workflowTask.getName())) continue;
            		workflowTasks.add(workflowTask);
            		
            	}
            }
            
            
        }
        
        return workflowTasks;
		
	}
	
	List<WorkflowTask> getWorkflowTasks(WorkflowInstance workflowInstance) {
		
		final String workflowInstanceId = workflowInstance.getId();
        final WorkflowTaskQuery taskQuery = new WorkflowTaskQuery();
        taskQuery.setActive(null);
        taskQuery.setProcessId(workflowInstanceId);
        taskQuery.setTaskState(WorkflowTaskState.IN_PROGRESS);
        taskQuery.setOrderBy(new OrderBy[]{OrderBy.TaskDue_Asc});

        return workflowService.queryTasks(taskQuery, true);
        
	}
	
	
	List<WorkflowTask> getUserTasks(String userName, boolean includePooled) {
		
		if (null == userName) {
			userName = authenticationService.getCurrentUserName();
		}
		
        final List<WorkflowTask> assignedTasks = new ArrayList<WorkflowTask>(); 
        assignedTasks.addAll(workflowService.getAssignedTasks(userName, WorkflowTaskState.IN_PROGRESS));
        
        if (includePooled) {
        	assignedTasks.addAll(workflowService.getPooledTasks(userName));
        }
		
        return assignedTasks;
        
	}

	
    public Map<String, String> getTransitions(final String taskId) {
    	
    	final Map<String, String> transitions = new HashMap<String, String>(1);

    	AuthenticationUtil.runAsSystem(new RunAsWork<Void>() {

			@Override
			public Void doWork() throws Exception {
				
				final WorkflowTask task = workflowService.getTaskById(taskId);
				final String taskName = task.getName();
				
				if (!transitionsCache.contains(taskName)) {
					
					if (taskId.startsWith("jbpm")) {
						transitions.putAll(getJbpmTransitions(task));
					}
					else if (taskId.startsWith("activiti")) {
						transitions.putAll(getActivitiTransitions(task));
					}
					transitionsCache.put(taskName, transitions);
					
				}
				
				transitions.putAll(transitionsCache.get(taskName));
				
				return null;
				
			}
    		
		});
		
		return transitions;
		
    }
    
    private Map<String, String> getJbpmTransitions(WorkflowTask task) {
    	
    	final Map<String, String> transitions = new HashMap<String, String>(0);
    	
        final WorkflowNode workflowNode = task.getPath().getNode();
        if (workflowNode == null) return transitions;
        
        for (WorkflowTransition transition : workflowNode.getTransitions()) {
            transitions.put(transition.getId(), transition.getTitle());
        }
        
        return transitions;
    	
    }
    
    private Map<String, String> getActivitiTransitions(WorkflowTask task) {

    	final Map<String, String> transitions = new HashMap<String, String>(0);
		final Map<QName, PropertyDefinition> properties = task.getDefinition().getMetadata().getProperties();
		if (null == properties) return transitions;
		
		final PropertyDefinition outcomePropertyName = properties.get(WorkflowModel.PROP_OUTCOME_PROPERTY_NAME);
		if (null == outcomePropertyName) return transitions;
		final String outcomePropertyName_ = outcomePropertyName.getDefaultValue();
		if (outcomePropertyName_.isEmpty()) return transitions;
		
		final PropertyDefinition outcomeProperty = properties.get(QName.createQName(outcomePropertyName_));
		if (null == outcomeProperty) return transitions;
		
		final List<ConstraintDefinition> constraints = outcomeProperty.getConstraints();
		for (ConstraintDefinition constraint : constraints) {
			final Constraint constraint_ = constraint.getConstraint();
			if (! (constraint_ instanceof ListOfValuesConstraint)) continue;
			
			final ListOfValuesConstraint lovConstraint = (ListOfValuesConstraint) constraint_;
			for (final String key : lovConstraint.getAllowedValues()) {
				transitions.put(key, lovConstraint.getDisplayLabel(key, dictionaryService));
			}
		}
		
		return transitions;
		
    }
	
	
	// IoC
	
	private WorkflowService workflowService;
	private AuthenticationService authenticationService;
	private AuthorityService authorityService;
	private NodeService nodeService;
	private DictionaryService dictionaryService;
	
	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}
	
	public void setAuthenticationService(AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}
	
	public void setAuthorityServicce(AuthorityService authorityService) {
		this.authorityService = authorityService;
	}
	
	public void setNodeService(NodeService nodeService) {
		this.nodeService = nodeService;
	}
	
	public void setDictionaryService(DictionaryService dictionaryService) {
		this.dictionaryService = dictionaryService;
	}
	
	public void setTransitionsCache(SimpleCache<String, Map<String, String>> transitionsCache) {
		this.transitionsCache = transitionsCache;
	}
		
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		
		this.setWorkflowService(serviceRegistry.getWorkflowService());
		this.setAuthenticationService(serviceRegistry.getAuthenticationService());
		this.setAuthorityServicce(serviceRegistry.getAuthorityService());
		this.setNodeService(serviceRegistry.getNodeService());
		this.setDictionaryService(serviceRegistry.getDictionaryService());
		
	}

	
}
