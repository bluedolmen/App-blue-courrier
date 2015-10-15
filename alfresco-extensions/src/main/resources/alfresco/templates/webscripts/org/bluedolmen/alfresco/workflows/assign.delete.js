///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">

(function() {
	
	var
		task = null,
		userName = null
	;
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs(
					{name : 'taskId', mandatory : true }
			),
			taskId = parseArgs['taskId'],
			currentUsername = Utils.Alfresco.getFullyAuthenticatedUserName();
		;
		
		task = workflow.getTask(taskId);
		if (null == task) {
			throw {
				code : Status.STATUS_NOT_FOUND,
				message : 'Cannot find any valid task with id ' + taskId
			}
		}
		
		if (!workflowUtils.canReassign(task, currentUsername)) {
			throw {
				code : Status.STATUS_METHOD_NOT_ALLOWED,
				message : 'You are not allowed to perform this operation'
			}
		}
		
		main();
		
	});
	
	function main() {

		workflowUtils.releaseTask(task, true /* force */);
		status.setCode(status.STATUS_NO_CONTENT, 'Pas de contenu');
		
	}
	
	
})();