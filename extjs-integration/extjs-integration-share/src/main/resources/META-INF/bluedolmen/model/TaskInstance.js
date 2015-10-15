Ext.define('Bluedolmen.model.TaskInstance', {
	extend : 'Ext.model.Model',
	
	fields : [
		'id',
		'url',
		'name',
		'title',
		'description',
		'state',
		'path',
		'isPooled',
		'isEditable',
		'isReassignable',
		'isClaimable',
		'isReleasable',
		'outcome',
		'owner',
		/*
		 * userName
		 * firstName
		 * lastName
		 */
		'properties',
		/*
		 * bpm_context
		 * bpm_status
		 * bpm_comment
		 * bpm_completionDate
		 * bpm_packageItemActionGroup
		 * cm_created
		 * cm_name
		 * bpm_percentComplete
		 * bpm_description
		 * bpm_hiddenTransitions
		 * bpm_package
		 * bpm_dueDate
		 * bpm_priority
		 * bpm_taskId
		 * bpm_reassignable
		 * bpm_startDate
		 * bpm_completedItems
		 * bpm_pooledActors
		 * bpm_packageActionGroup
		 * cm_content
		 * bpm_outcome
		 * cm_owner 
		 */
		'propertyLabels',
		/*
		 * bpm_priority
		 * bpm_status
		 */
		'workflowInstance',
		/*
		 * id
		 * url
		 * name
		 * title
		 * description
		 * isActive
		 * startDate
		 * priority
		 * message
		 * endDate
		 * dueDate
		 * context
		 * package
		 * initiator (userName, firstName, lastName)
		 * definitionUrl 
		 */
		'definition',
		/*
		 * id
		 * url
		 * type (name, title, description, url)
		 * node (name, title, description, isTaskNode, transitions (id, title, description, isDefault, isHidden) )
		 */
	         
	]

});
