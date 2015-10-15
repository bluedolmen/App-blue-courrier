///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var _fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
	
	var distributeDocumentGet = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		includeNonValidated : false,
		
		fullyAuthenticatedUserName : Utils.Alfresco.getFullyAuthenticatedUserName(),
		
		wsArguments : [
   			'includeNonValidated'
   		],
   		
   		prepare : function() {
   			
     		this.includeNonValidated = 'true' === Utils.asString(this.parseArgs['includeNonValidated']).toLowerCase();
   			
   			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);
   			
   		},

   		isExecutable : function(task) {
   			
//   			if (!Utils.Alfresco.hasPermission(node, 'Read', this.fullyAuthenticatedUserName)) {
//   				return 'You do not have the permission to get the current shares of this document';
//   			} 
   			
   			return true;
   			
   		},
   		
		doExecute : function(task) {
			
			var 
				result = {},
				currentShares = Yamma.DeliveryUtils.getCurrentShares(this.node),
				taskShares = Yamma.DeliveryUtils.getBPMStoredShares(task)
			;
			
			taskShares.add(currentShares); // will update the status of the current shares as a side effect
			
			this.nodeTasks = workflowUtils.getTasksForNode(this.node);
			
			result.currentShares = {
				localUsers : [], // not available anymore
				services : taskShares.services,
				externalUsers : [] // not available anymore
			};
			
			result.task = this._getTaskDescription(task)
			
			return result; // outcome
			
		},
		
		_getTaskDescription : function(task) {
			
			function getPooledActors() {
				
				var
					pooledActors = Utils.toArray(task.properties['bpm:pooledActors'])
				;
				
				return Utils.Array.map(pooledActors, function(pooledActor) {
					pooledActor = search.findNode(pooledActor);
					return Utils.asString(pooledActor.properties['cm:authorityName']) || Utils.asString(pooledActor.properties['cm:userName']);
				});
				
			}
			
			var 
				taskId = task.id,
				taskName = task.name,
				taskOwner = Utils.asString(task.properties['cm:owner']),
				pooledActors = getPooledActors(),
				properties = Utils.Alfresco.BPM.getNonAlfrescoProperties(task),
				status = Utils.asString(task.properties['bpm:status']),
				description = {
					id : taskId,
					name : taskName,
					status : status,
					properties : properties,
					owner : taskOwner,
					pooledActors : pooledActors,
					actions : Utils.keys(workflowUtils.getTransitions(task))
				}
			;
			
			return description;
			
		}
		
	});

	distributeDocumentGet.execute();
	
})();
