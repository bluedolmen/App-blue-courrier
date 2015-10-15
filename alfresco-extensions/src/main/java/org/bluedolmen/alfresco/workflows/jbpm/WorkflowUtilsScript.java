package org.bluedolmen.alfresco.workflows.jbpm;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.alfresco.repo.jscript.BaseScopableProcessorExtension;
import org.alfresco.repo.jscript.ScriptNode;
import org.alfresco.repo.jscript.ScriptableHashMap;
import org.alfresco.repo.jscript.ValueConverter;
import org.alfresco.repo.workflow.WorkflowModel;
import org.alfresco.repo.workflow.WorkflowPackageComponent;
import org.alfresco.repo.workflow.activiti.ActivitiNodeConverter;
import org.alfresco.repo.workflow.jscript.JscriptWorkflowTask;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AuthenticationService;
import org.alfresco.service.cmr.workflow.WorkflowInstance;
import org.alfresco.service.cmr.workflow.WorkflowService;
import org.alfresco.service.cmr.workflow.WorkflowTask;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.Scriptable;
import org.springframework.extensions.webscripts.ScriptableWrappedMap;

public final class WorkflowUtilsScript extends BaseScopableProcessorExtension {
	
//	private static Log logger = LogFactory.getLog(WorkflowUtilsScript.class);
	private ValueConverter valueConverter = new ValueConverter();
	
	public boolean canReassign(JscriptWorkflowTask task, String userName) {
		
		final String taskId = task.getId();
		return workflowUtils.canReassign(taskId, userName);
		
	}
	
	public void updateTaskProperties(JscriptWorkflowTask task, Scriptable properties) {
		
		final String taskId = task.getId();
		final Map<QName, Serializable> properties_ = extractScriptableProperties(properties);
        
		workflowService.updateTask(taskId, properties_, null, null);
		
	}
	
    private Map<QName, Serializable> extractScriptableProperties(Scriptable scriptable) {
    	
        final Object[] propIds = scriptable.getIds();
        final Map<QName, Serializable> properties = new HashMap<QName, Serializable>(propIds.length);
        
        for (int i = 0, len = propIds.length; i < len; i++) {
        	
            final Object propId = propIds[i];            
            if (! (propId instanceof String) ) continue;
            
            final String key = (String)propId;
            Object value = scriptable.get(key, scriptable);
            if (! (value instanceof Serializable) ) continue;
            
            value = valueConverter.convertValueForRepo( (Serializable) value );
            properties.put( QName.createQName(key, namespaceService), (Serializable) value );
            
            
            
        }
        
        return properties;
        
    }
    
	public void addTaskAssociations(JscriptWorkflowTask task, String associationName, NativeArray associationList) {
		
		final String taskId = task.getId();
		final Map<QName, List<NodeRef>> add = new HashMap<QName, List<NodeRef>>();
		final QName associationQName = QName.createQName(associationName, namespaceService);
		final List<NodeRef> targetNodeRefs = extractNodeList(associationList);
		add.put(associationQName, targetNodeRefs);
		
		workflowService.updateTask(taskId, null, add, null /* remove */);
		
	}

	public void removeTaskAssociations(JscriptWorkflowTask task, String associationName, NativeArray associationList) {
		
		final String taskId = task.getId();
		final Map<QName, List<NodeRef>> remove = new HashMap<QName, List<NodeRef>>();
		final QName associationQName = QName.createQName(associationName, namespaceService);
		final List<NodeRef> targetNodeRefs = extractNodeList(associationList);
		remove.put(associationQName, targetNodeRefs);
		
		workflowService.updateTask(taskId, null, null /* add */, remove);
		
	}
	
	
	private List<NodeRef> extractNodeList(NativeArray associationList)  {
		
		final ValueConverter valueConverter = new ValueConverter();
		
		final Object inputFilesAsObject = valueConverter.convertValueForJava(associationList);
		if (!(inputFilesAsObject instanceof List<?>)) {
			throw new IllegalArgumentException("The provided argument is not an array as expected");
		}
		final List<NodeRef> inputFiles = getCheckedList((List<?>) inputFilesAsObject);
		
		return inputFiles;
		
	}
	
	private List<NodeRef> getCheckedList(Collection<?> nodeRefList) {
		
		final List<NodeRef> checkedList = new ArrayList<NodeRef>();
		for (final Object obj : nodeRefList) {
			
			if (!(obj instanceof NodeRef)) {
				throw new IllegalArgumentException("The list of files should only contain valid nodes");
			}
			
			checkedList.add((NodeRef) obj);
		}
	
		return checkedList;
	}
	
	public Scriptable getPooledActors(JscriptWorkflowTask task) {
		
		checkTaskIsValid(task);
		final String taskId = task.getId();
		
		final Set<String> pooledActors = workflowUtils.getPooledActors(taskId);		
		return (Scriptable) valueConverter.convertValueForScript(serviceRegistry, getScope(), null, (Serializable) pooledActors);
		
	}
	
    public String getAssigned(JscriptWorkflowTask task) {
    	
    	checkTaskIsValid(task);
    	
		final String taskId = task.getId();
		return workflowUtils.getAssigned(taskId);
		
    }

	public boolean isOwner(JscriptWorkflowTask task, String userName) {
		
		checkTaskIsValid(task);
		
		if (null == userName) {
			userName = authenticationService.getCurrentUserName();
		}
		
		final String currentOwner = getAssigned(task);
		return userName.equals(currentOwner);
		
	}	    
    
	public void claimTask(JscriptWorkflowTask task, boolean force) {
		
		claimTask(task, null, force);
		
	}
	
	public void reassign(JscriptWorkflowTask task, String userName) {

		claimTask(task, userName, true /* force */);
		
	}

	public void claimTask(JscriptWorkflowTask task, String userName, boolean force) {
		
		checkTaskIsValid(task);
		
		final String taskId = task.getId();
		workflowUtils.claimTask(taskId, userName, force);

	}	
	
	public void releaseTask(JscriptWorkflowTask task, boolean force) {

		checkTaskIsValid(task);
		
		final String taskId = task.getId();
		workflowUtils.releaseTask(taskId, force);
		
	}
	
	public boolean isTaskEditable(JscriptWorkflowTask task) {
		
		checkTaskIsValid(task);
		final String taskId = task.getId();
		final String currentUserName = authenticationService.getCurrentUserName();
		final WorkflowTask workflowTask = workflowService.getTaskById(taskId);
		
		return workflowService.isTaskEditable(workflowTask, currentUserName);
		
	}
	
	public Scriptable getTasksForNode(ScriptNode node) {
		
		if (null == node) return null;
		
		final NodeRef nodeRef = node.getNodeRef();
        final List<WorkflowTask> workflowTasks = workflowUtils.getActiveTasksForNode(nodeRef, null, null);
        
		return wrapAsScriptable(workflowTasks);
		
	}
	
	public Scriptable getMyTasks() {
		return getTasksForUser(null);
	}

	public Scriptable getTasksForUser(String userName) {
		
		final List<WorkflowTask> workflowTasks = workflowUtils.getUserTasks(userName, true);
		return wrapAsScriptable(workflowTasks);
		
	}
	
	private Scriptable wrapAsScriptable(List<WorkflowTask> workflowTasks) {
		
        final List<JscriptWorkflowTask> jscriptWorkflowTasks = new ArrayList<JscriptWorkflowTask>();
        
        for (WorkflowTask workflowTask : workflowTasks) {
        	jscriptWorkflowTasks.add(new JscriptWorkflowTask(workflowTask, serviceRegistry, getScope()));
        }
        
        final Scriptable result = Context.getCurrentContext().newArray(this.getScope(), jscriptWorkflowTasks.toArray());
        
        return result;
        
	}
	
	private void checkTaskIsValid(JscriptWorkflowTask task) {
		
		if (null == task) {
			throw new IllegalArgumentException("The provided task has to be defined (non-null)");
		}
		
	}
	
	public Scriptable getPackageResources(JscriptWorkflowTask task) {
		
		if (null == task) return null;
		
		
		final String taskId = task.getId();
		final List<NodeRef> resources = workflowService.getPackageContents(taskId);
		
		return (Scriptable) valueConverter.convertValueForScript(serviceRegistry, getScope(), null, (Serializable) resources);
		
	}
	
	public Scriptable getTaskProperties(JscriptWorkflowTask task) {
		return getTaskProperties(task, true);
	}
	
	public Scriptable getTaskProperties(JscriptWorkflowTask task, boolean includeSystem) {
		return getTaskProperties(task, includeSystem, false);
	}
	
	public Scriptable getTaskProperties(JscriptWorkflowTask task, boolean includeSystem, boolean expandedForm) {
		
		if (null == task) return null;
		
		final String taskId = task.getId();
		final WorkflowTask workflowTask = workflowService.getTaskById(taskId);
		final Map<String, Serializable> result = new HashMap<String, Serializable>();
		
		for (final Map.Entry<QName, Serializable> entry : workflowTask.getProperties().entrySet()) {

			final QName key = entry.getKey();
			
			if (!includeSystem) {
				final String namespace = key.getNamespaceURI();
				if (NamespaceService.BPM_MODEL_1_0_URI.equals(namespace)) continue;
				if (NamespaceService.CONTENT_MODEL_1_0_URI.equals(namespace)) continue;
			}
			
			final String keyAsString = expandedForm ? key.toString() : key.toPrefixString();
			final Serializable value = entry.getValue();
			
			result.put(keyAsString, value);
			
		}
		
		return new ScriptableWrappedMap(result);
		
	
	}
	
	public Scriptable getTransitions(JscriptWorkflowTask task) {
		
		final Map<String, String> transitions = workflowUtils.getTransitions(task.getId());
		final ScriptableHashMap<String, String> result = new ScriptableHashMap<String, String>();
		result.putAll(transitions);
		
		return result;
		
	}
	
	public Object toJavaCollection(NativeArray nativeArray) {
		
		return valueConverter.convertValueForJava(nativeArray);
		
	}
	
	public ScriptNode createNewPackage(ScriptNode node, String workflowInstanceId) {
		
		final NodeService nodeService = serviceRegistry.getNodeService();
		final WorkflowService workflowService = serviceRegistry.getWorkflowService();
		final NodeRef nodeRef = node.getNodeRef();
		final NodeRef workflowPackage = workflowService.createPackage(null);
		
		final int cn = nodeService.getChildAssocs(nodeRef, Collections.singleton(WorkflowModel.ASSOC_PACKAGE_CONTAINS)).size();
		final ChildAssociationRef childAssoc = nodeService.getPrimaryParent(nodeRef);
		final QName childName = QName.createQName(childAssoc.getQName().getNamespaceURI(), childAssoc.getQName().getLocalName() + "-" + cn);
		
		nodeService.addChild(workflowPackage, nodeRef, WorkflowModel.ASSOC_PACKAGE_CONTAINS, childName );
		
		final WorkflowInstance workflowInstance = workflowService.getWorkflowById(workflowInstanceId);
		if (null == workflowInstance) {
			throw new IllegalArgumentException("The provided workflow-id does not match any workflow instance");
		}
		
		workflowPackageComponent.setWorkflowForPackage(workflowInstance);
		
		return new ScriptNode(workflowPackage, serviceRegistry);
		
	}
	
	public Object toActivitiNode(ScriptNode node) {
		
		if (null == node) return null;
		return activitiNodeConverter.convertNode(node.getNodeRef());
		
	}
	
	
	// IoC
	
	private ServiceRegistry serviceRegistry; // for JScriptWorkflowTask
	private WorkflowService workflowService;
	private AuthenticationService authenticationService;
	private NamespaceService namespaceService;
	private WorkflowUtils workflowUtils;
	private ActivitiNodeConverter activitiNodeConverter;
	private WorkflowPackageComponent workflowPackageComponent;
	
	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}
	
	public void setAuthenticationService(AuthenticationService authenticationService) {
		this.authenticationService = authenticationService;
	}
	
	public void setNamespaceService(NamespaceService namespaceService) {
		this.namespaceService = namespaceService;
	}
	
	public void setWorkflowPackageComponent(WorkflowPackageComponent workflowPackageComponent) {
		this.workflowPackageComponent = workflowPackageComponent;
	}
	
	public void setServiceRegistry(ServiceRegistry serviceRegistry) {
		
		this.serviceRegistry = serviceRegistry;
		if (null == serviceRegistry) return;
		
		this.setWorkflowService(serviceRegistry.getWorkflowService());
		this.setAuthenticationService(serviceRegistry.getAuthenticationService());
		this.setNamespaceService(serviceRegistry.getNamespaceService());
		this.activitiNodeConverter = new ActivitiNodeConverter(serviceRegistry);
		
	}
	
	public void setWorkflowUtils(WorkflowUtils workflowUtils) {
		this.workflowUtils = workflowUtils;
	}
	
}
