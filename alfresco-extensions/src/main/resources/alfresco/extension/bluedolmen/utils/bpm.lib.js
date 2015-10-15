(function() {
	
	var 
		_myTasks = null,
		_myTasksByNode = null,
		_executionContext = ('undefined' != typeof executionContext ? executionContext : null) || ('undefined' != typeof execution ? execution : null)
	;
	
	BPMUtils = Utils.ns('Utils.Alfresco.BPM');
	
	BPMUtils.getPackage = function() {
		
		if ('undefined' != typeof bpm_package) return bpm_package;
		var bpm_package_ = BPMUtils.getContextVariable('bpm_package');
		if (null == bpm_package_) return null;
		
		return search.findNode(bpm_package_.nodeRef); // ensure scope is set correctly
		
	}
	
	BPMUtils.getFirstPackageResource = function(bpmPackage) {
		
		if (null == bpmPackage) {
			bpmPackage = BPMUtils.getPackage();
			
			if (null == bpmPackage) return null;
		}
		
		var resources = bpmPackage.childAssocs['bpm:packageContains'];
		if (null == resources) return null;
		if (resources.length == 0) return null; 
		
		return resources[0];
		
	}	
	
	BPMUtils.getContextVariable = function(variableName) {
		
		variableName = Utils.asString(variableName);
		
		if (!variableName) {
			throw new Error('IllegalArgumentException! A variable-name must be a valid non-empty string');
		}
		
		if (null == _executionContext) {
			throw new Error('IllegalStateException! Cannot get the execution-context');
		}
		
		return _executionContext.getVariable(variableName);
		
	}
	
	BPMUtils.getTasksForWorkflow = function(workflowinstance) {
		
		var tasks = [];
		
		if (Utils.isString(workflowinstance)){
			workflowinstance = workflow.getInstance(workflowinstance);
		}
		
		if (null == workflowinstance) return []; 
		
		Utils.forEach(workflowinstance.getPaths(), function(path) {
			tasks.push.apply(tasks, path.getTasks());
		});
		
		return tasks;
		
	}
	
	BPMUtils.getMyTasks = function(includePooled, resetCached) {
		
		if (true === resetCached) {
			_myTasks = null;
		}
		
		if (null == _myTasks) {
			
			_myTasks = workflowUtils.getTasksForUser(Utils.Alfresco.getFullyAuthenticatedUserName());
//
//			var
//				pooledTasks = false === includePooled ? [] : (workflow.getPooledTasks(Utils.Alfresco.getCurrentUserName()) || []),
//				assignedTasks = workflow.getAssignedTasks() || [],
//				allTasks = pooledTasks.concat(assignedTasks)
//			;
//				
//			_myTasks = allTasks;
			
		}
		
		return _myTasks;
		
	};
	
	/**
	 * @param {ScriptNode} node
	 * @param {Boolean} [includePooled=true] whether to include the pooled tasks
	 * @param {Boolean} [resetCached=false] whether to reset the cached resource (depends on the execution context)
	 * @param {Boolean/Array[NodeRef]} [pooledCachedValues = []] the values that should be cached for better performances OR true to cache all the nodes
	 */
	BPMUtils.getMyNodeTasks = function(node, includePooled, resetCached, pooledCachedValues) {
		
		if (null == node) return [];
		pooledCachedValues = pooledCachedValues || [];
		
		if (resetCached) {
			_myTasksByNode = null;
		}
		
		var 
			myTasks = BPMUtils.getMyTasks(includePooled, resetCached),
//			myTaskIds = Utils.arrayToMap(myTasks, function(task) { return task.getId(); }),
			nodeRef = Utils.asString(node.nodeRef)
		;
		
		if (null != _myTasksByNode) {
			return _myTasksByNode[nodeRef] || [];
		}
		
////
//// This following method cannot be used in the general case since the subprocess tasks
//// are not returned !
////
////		var activeTasks = [];
////		Utils.forEach(node.activeWorkflows || [], function(workflowInstance){
////			var paths = workflowInstance.getPaths();
////			if (null == paths) return;
////			
////			Utils.forEach(paths, function(path) {
////
////				var tasks = path.getTasks();
////				if (null == tasks) return;
////				
////				Utils.forEach(tasks, function(task) {
////					var taskId = task.getId();
////					if (null == myTaskIds[taskId]) return;
////					
////					activeTasks.push(task);
////				});
////				
////			})
////			
////		});
		
		var 
			myTasksByNode = Utils.arrayToMap(
					
				myTasks,
				
				function keyFunction(myTask) {
					var workflowDocument = (workflowUtils.getPackageResources(myTask) || [null])[0];
					return (null == workflowDocument ? null : Utils.asString(workflowDocument.nodeRef) )
				},
				
				true /* authorizeDuplicates */
				
			),
			
			myTasksNode = myTasksByNode[nodeRef] || []
		;

		// Process pooled tasks
		if (true === pooledCachedValues) {
			_myTasksByNode = myTasksByNode;
		}
		else if (!Utils.isArrayEmpty(pooledCachedValues)) {
			_myTasksByNode = {};
			Utils.forEach(pooledCachedValues, function(nodeRef) {
				var myTasksNode = myTasksByNode[nodeRef];
				if (null == myTasksNode) return;
				
				_myTasksByNode[nodeRef] = myTasksNode;
			});
		}
		
		return myTasksNode;
		
	};
	
	BPMUtils.filterTasks = function(tasks, filter) {
		
		var filteredTaskNames = null;
		
		function filterByTaskName(task) {
			return Utils.contains(filteredTaskNames, Utils.asString(task.name));
		}
		
		if (Utils.isString(filter)) {
			filteredTaskNames = [Utils.asString(filter)];
			filter = filterByTaskName;
		}
		else if (Utils.isArray(filter)) {
			filteredTaskNames = Utils.map(filter, Utils.asString);
			filter = filterByTaskName;
		}
		else if (!Utils.isFunction(filter)) {
			throw new Error('Cannot manager filters other than string, array of string or function');
		}
		
		return Utils.filter(tasks, filter);
		
	};
	
	BPMUtils.getMyFilteredNodeTasks = function(node, filter, includePooled, resetCached) {

		var 
			myActiveTasks = BPMUtils.getMyNodeTasks(node, includePooled, resetCached),
			filteredTasks = BPMUtils.filterTasks(myActiveTasks, filter)
		;
		
		return filteredTasks;
		
	};
	
	BPMUtils.getTask = function(task) {
		
		if (Utils.isString(task)) {
			task = workflow.getTask(task);
		}
		
		if (null == task) {
			throw new Error('IllegalParameterException! The provided task is not a valid task');
		}
		
		return task;
		
	};
	
	/*
	 * Manage task status
	 * 
	 * Alfresco normally manages its status itself using only two status:
	 * - 'Not Yet Started'
	 * - and 'Completed'
	 * 
	 * This piece of API is intended to enable the user to update the status according
	 * to all the states admitted by the model constraint including these 3 additional
	 * states:
	 * - 'In Progress'
	 * - 'On Hold'
	 * - 'Cancelled'
	 * 
	 * This may be used in advanced scenarii; however it needs a good understanding of
	 * the Alfresco BPM mapping.
	 */
	
	// Not defined in Java
	BPMUtils.TaskStatus = {
		NOT_YET_STARTED : 'Not Yet Started',
		IN_PROGRESS : 'In Progress',
		ON_HOLD : 'On Hold',
		CANCELLED : 'Cancelled',
		COMPLETED : 'Completed'
	};
	
	BPMUtils.getTaskStatus = function(task) {
		
		task = BPMUtils.getTask(task);		
		return Utils.asString(task.properties['bpm:status']);
		
	};

	BPMUtils.setTaskStatus = function(task, status) {

		task = BPMUtils.getTask(task);
		var previousStatus = BPMUtils.getTaskStatus(task);
		
		if (null == status) {
			throw new Error('IllegalParameterException! The provided status is not valid');
		}
		
		if (previousStatus == status) return false;
		
		workflowUtils.updateTaskProperties(task, {
			'bpm:status' : status
		});
		
		return true;
		
	};
	
	// End task status
	
	BPM_NS_PREFIX = '{http://www.alfresco.org/model/bpm/1.0}';
	CONTENT_NS_PREFIX = '{http://www.alfresco.org/model/content/1.0}';
	
	BPMUtils.getNonAlfrescoProperties = function(task, valueAdapter) {
		
		if (null == task) return {};
		
		var 
			properties = task.properties,
			filteredProperties = {}
		;
		
		valueAdapter = Utils.isFunction(valueAdapter) ? valueAdapter : function(value) {
			return Utils.asString(value);
		};
		
		for (var propertyName in properties) {
			
			if (Utils.String.startsWith('{}')) continue; // no namespace
			
			// BPM-model
			if (Utils.String.startsWith(propertyName, BPM_NS_PREFIX) ) continue;

			// Content-model
			if (Utils.String.startsWith(propertyName, CONTENT_NS_PREFIX) ) continue;			
			
			filteredProperties[propertyName] = valueAdapter(properties[propertyName], propertyName);
			
		}
		
		return filteredProperties;
		
	};
	
	function copyTo_(variables, copyFunction) {
		
		variables = [].concat(variables || []);
		
		Utils.Array.forEach(variables || [], function(variableName) {
			
			if (Utils.isString(variableName)) {
				
				copyFunction(variableName, variableName);
				
			}
			else {  // supposed to be an object
				
				Utils.forEach(Utils.keys(variableName), function(variableName_) {
					copyFunction(variableName_, variableName[variableName_]);
				});
				
			}
			
		});
		
	}

	BPMUtils.copyTaskVariablesToExecution = function(variables) {
		
		if ('undefined' == typeof execution || 'undefined' == typeof task) return;
		
		copyTo_(variables, copyValue);
		
		function copyValue(sourceName, targetName) {
			execution.setVariable(targetName, task.getVariableLocal(sourceName));
		}
		
	};

	BPMUtils.copyExecutionVariablesToTask = function(variables) {
		
		if ('undefined' == typeof task) return;
		
		copyTo_(variables, copyValue);
		
		function copyValue(sourceName, targetName) {
			task.setVariableLocal(targetName, BPMUtils.getContextVariable(sourceName));
		}
		
	};
	
})();