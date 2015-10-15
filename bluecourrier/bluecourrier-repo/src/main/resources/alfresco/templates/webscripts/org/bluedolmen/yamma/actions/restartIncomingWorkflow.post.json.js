///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/inmail-utils.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	var 
		lastProcessingActor_ = undefined,
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName()
	;
	
	function getLastProcessingActor(node) {
		
		if (undefined === lastProcessingActor_) {
			
			var 
				events = HistoryUtils.getHistoryEvents(node, 'acceptProcessing'),
				firstEvent = events[0]
			;
			if (null == firstEvent) return null;
			
			lastProcessingActor_ = Utils.asString(events[0].properties[YammaModel.EVENT_REFERRER_PROPNAME]); 
			
		}
		
		return lastProcessingActor_;
		
	}
	
	/**
	 * The incoming-document workflow is launchable if :
	 * - There is no incoming-document workflow currently running
	 * - Either the instructor who managed the document 
	 * - or the service-manager
	 * 
	 */
	function isIncomingDocumentWorkflowLaunchable(node, userName) {
		
		if (null == node) return false;
		userName = userName || fullyAuthenticatedUserName;

		if (Utils.Array.exists(node.activeWorkflows, function(workflow) {
			return 'bcwfincoming:IncomingDocument' == Utils.asString(workflow.definition.name);
		})) return 'The incoming workflow is already started';
		
		var enclosingServiceName = Utils.Alfresco.getEnclosingSiteName(node);
		if (enclosingServiceName) {
			if (ServicesUtils.isServiceManager(enclosingServiceName, userName)) return true;
		}
		
		var lastProcessingActor = getLastProcessingActor(node);
		if (userName == lastProcessingActor) return true;
		
		var processedBy = Utils.wrapString(node.properties[YammaModel.PROCESSED_BY_PROPNAME]);
		if (userName == processedBy) return true;
		
		return 'You need to be either a Service Manager or the instructor who processed the document';
		
	}
	
	
	var restartIncomingAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		assignToMe : false,
		
		wsArguments : [
  			'assignToMe'
  		],

  		prepare : function() {
  			
  			this.assignToMe = 'true' == Utils.asString(this.parseArgs['assignToMe']).toLowerCase();
  			
  		},		
		
		
		isExecutable : function(node) {
			
			return isIncomingDocumentWorkflowLaunchable(node);
			
		},
		
		doExecute : function(node) {
			
			IncomingMailUtils.startIncomingWorkflow(
				node, 
				false /* validateDelivering is not relevant */, 
				{
					'bcwfincoming:restartAssignedActor' : this.assignToMe ? fullyAuthenticatedUserName : getLastProcessingActor(node) || fullyAuthenticatedUserName
				} /* extraParameters */
			);
			
			var 
				tasks = workflowUtils.getTasksForNode(node);
				pendingTasks = Utils.Array.filter(tasks, function(task) {					
					return 'bcwfincoming:Pending' == Utils.wrapString(task.name);
				}),
				pendingTask = pendingTasks[0]
			;
				
			if (null == pendingTask) {
				throw {
					code : 500,
					message : 'IllegalStateException! Cannot retrieve the pending task after starting the incoming workflow'
				};
			}
				
			pendingTask.endTask('restart');
			
		}
		
	});
	
	restartIncomingAction.execute();	
	
})();