///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/tasks/tasks.get.lib.js">

(function() {
	
	Common.securedExec(function() {
		
		main();
		
	});

	function main() {
		
		var 
			userTasks = TasksLib.getBlueCourrierTasks()			
		;
		
		model.tasks = {
			count : TasksLib.getCount(userTasks),
			lateCount : TasksLib.getLateState(userTasks, YammaModel.LATE_STATE_LATE),
			lastUpdate : TasksLib.getLastUpdate(userTasks)
		};
		
	}
	
})();
