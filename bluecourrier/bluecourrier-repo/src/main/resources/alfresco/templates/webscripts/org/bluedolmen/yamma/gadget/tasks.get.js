///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/tasks/tasks.get.lib.js">

(function() {
	
	var 
		userName = null
	;
	
	Common.securedExec(function() {
		
		var parseArgs = new ParseArgs('username');
		userName = Utils.asString(parseArgs['username']);
		
		main();
		
	});

	function main() {
		
		if (!userName) {
			
			throw {
				code : 400,
				message : 'The username is mandatory'
			};
		
		}
		
		var 
			userTasks = TasksLib.getBlueCourrierTasks(userName),
			taskDescriptions = Utils.map(userTasks, function(task) {
				return TasksLib.getTaskDescription(task, userName); 
			});
		;
		
		model.tasks = {
			count : TasksLib.getCount(userTasks),
			tasks : taskDescriptions	
		};
		
	}
	
})();
