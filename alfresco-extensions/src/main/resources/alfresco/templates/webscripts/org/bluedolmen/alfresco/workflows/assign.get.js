///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">


(function() {
	
	var
		task = null,
		canReassign = false,
		currentAssigned = null,
		showAvailableActors = false
	;
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
					{name : 'taskId', mandatory : true },
					{name : 'showAvailableActors', type : 'boolean'}
			),
			taskId = parseArgs['taskId'],
			currentUsername = Utils.Alfresco.getFullyAuthenticatedUserName()
		;
		
		task = workflow.getTask(taskId);
		if (null == task) {
			throw {
				code : Status.STATUS_NOT_FOUND,
				message : 'Cannot find any valid task with id ' + taskId
			}
		}
		
		canReassign = workflowUtils.canReassign(task, currentUsername);
		currentAssigned = workflowUtils.getAssigned(task);
		showAvailableActors = 'true' == Utils.asString(parseArgs['showAvailableActors']).toLowerCase();
		
		main();
		
	});
	
	function main() {

		model.canReassign = canReassign;
		
		model.currentAssigned = null != currentAssigned ? people.getPerson(currentAssigned) : null;
		
		if (showAvailableActors) {
			
			model.availableActors = canReassign
				? Utils.map(workflowUtils.getPooledActors(task), function(pooledActor) {
					return people.getPerson(pooledActor);
				})
				: [];
			
		}
		
		
	}
	
	
})();