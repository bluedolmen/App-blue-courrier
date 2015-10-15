Ext.define('Yamma.view.mails.gridactions.SimpleTaskRefGridAction', {
	
	extend : 'Yamma.view.mails.gridactions.GridAction',
	
	statics : {
		
		TASKS_PROPERTY_NAME : 'mytasks',
		
		hasTask : function(record) {
			
			var tasks = record.get(Yamma.view.mails.gridactions.SimpleTaskRefGridAction.TASKS_PROPERTY_NAME) || [];
			return !Ext.isEmpty(tasks);
			
		},
		
		getFirstMatchingTask : function(recordOrTasks, taskName) {
			
			var
				taskNames = [].concat(taskName),
				tasks = ( Ext.isArray(recordOrTasks) ? recordOrTasks : recordOrTasks.get(Yamma.view.mails.gridactions.SimpleTaskRefGridAction.TASKS_PROPERTY_NAME) ) || [],
			
				matchingTask = Ext.Array.findBy(tasks, function(task) {
					var taskName = task.name;
					return Ext.Array.contains(taskNames, taskName);
				})
			;
			
			return matchingTask;
			
		},
		
		getTaskProperties : function(record, taskName) {
			
			var task = Yamma.view.mails.gridactions.SimpleTaskRefGridAction.getFirstMatchingTask(record, taskName);
			if (!task) return null;
			
			return task.properties || null;
			
		}		
	
	},
	
	taskName : null,
	actionName : null,
	availableIfOwner : false,
	discardIfOwner : false,
	supportBatchedNodes : false,
	
	useTaskCache : true,
	
	status : null,
	
	actionUrl : 'alfresco://bluedolmen/yamma/task-action', // generic url
	
	getParameters : function(record) {
		var documentTaskRef = this.getDocumentTaskRefRecordValue(record);
		return [documentTaskRef];
	},
	
	getAllTasks : function(record) {
		
		return record.get(Yamma.view.mails.gridactions.SimpleTaskRefGridAction.TASKS_PROPERTY_NAME);
		
	},
	
	isAvailable : function(record, context) {
		
		var
			me = this,
			isAvailable_ = this.callParent(arguments)
		;
		if (!this.taskName) return isAvailable_;
		
		var
			actionName = this.actionName,
			taskNames = [].concat(this.taskName),
			tasks = this.getAllTasks(record)
		;
		
		return Ext.Array.some(tasks, function(task) {
			
			var 
				taskName = task.name,
				taskOwner = task.owner,
				taskStatus = task.status
			;
			
			return (
					
				Ext.Array.contains(taskNames, taskName) &&
				
				( false !== task.isActor ) &&
				
				( null == me.status || taskStatus == me.status ) &&
					
				( true !== me.discardIfOwner || false === taskOwner ) &&
				( true !== me.availableIfOwner || true === taskOwner ) &&
				
				(
					null == actionName ||
					
					(
						Ext.isArray(task.actions) && 
						Ext.Array.contains(task.actions, actionName)
					)
				)
				
			);
			
		});		
				
	},
	
	_firstMatchingTask : undefined,
	
	getFirstMatchingTask : function(record) {
		
		if (null == record) return null;
		
		var matchingTask;// = this._firstMatchingTask;
		
		if (undefined === matchingTask) {
			
			var
				taskNames = [].concat(this.taskName),
				tasks = this.getAllTasks(record)		
			;
			
			matchingTask = Ext.Array.findBy(tasks, function(task) {
				var taskName = task.name;
				return Ext.Array.contains(taskNames, taskName);
			});
			
			if (false !== this.useTaskCache) {
				this._firstMatchingTask = matchingTask;
			}
			
		}
		
		return matchingTask;
		
	},
	
	/**
	 * Beware!!! This method may not lead to the expected behavior
	 * particularly if several instances of the same workflow are
	 * launched on a node.
	 * @param record
	 * @param taskName
	 * @returns
	 */
	getDocumentTaskRefRecordValue : function(record) {
		
		var matchingTask = this.getFirstMatchingTask(record);
		if (null == matchingTask) return null;
		return matchingTask.id;
		
	},
	
	performBatchAction : function(records, preparationContext) {
		
		if (this.supportBatchedNodes) {
		
			var 
				me = this,
				taskRefs = Ext.Array.map(records, function(record) {
					return me.getDocumentTaskRefRecordValue(record);
				}), 
				doPerformAction = this.fireEvent('beforePerform', this, null, {taskRefs : taskRefs}, this.grid)
			;
			if (false === doPerformAction) return; // continue
			
			this.performServerRequest(taskRefs, preparationContext);
//			this.fireEvent('actionComplete', this, this.grid, arguments);
			
		} else {
			
			this.callParent(arguments);
			
		}
		
	},
	
	performAction : function(taskRef, preparationContext) {
		
		this.performServerRequest(taskRef, preparationContext);
		this.callParent();
		
	},	
	
	performServerRequest : function(taskRefValue, preparationContext) {
		
		var 
			dataObj = {
				taskRef : taskRefValue,
				action : this.actionName || undefined
			},
			additionalRequestParameters = this.getAdditionalRequestParameters(preparationContext)
		;
		
		this.jsonRequest(
				Ext.applyIf(dataObj, additionalRequestParameters), 
				null /* scope */, 
				[preparationContext] /* handlerArgs */
		);
		
	},
	
	getAdditionalRequestParameters : function() {
		return null;
	},
	
	onPreparationReady : function(records, preparationContext) {
		
		var
			me = this,
			nodeRefs = Ext.Array.map(records, function(record){
				return me.getDocumentNodeRefRecordValue(record);
			})
		;
		
		preparationContext = Ext.apply(preparationContext, {nodeRefs : nodeRefs});
		
		this.callParent([records, preparationContext]);
		
	},
	
	getContextNodeRefs : function(context) {
		
		if (null == context) return null;
		
		var nodeRefs = context.nodeRefs;
		if (null == nodeRefs) return null;
		
		if (!Ext.isArray(nodeRefs)) return nodeRefs;
		
		if (nodeRefs.length > 1) return nodeRefs;
		
		return nodeRefs[0] || null; // unwrap single nodeRef
		
	}
	
	
});