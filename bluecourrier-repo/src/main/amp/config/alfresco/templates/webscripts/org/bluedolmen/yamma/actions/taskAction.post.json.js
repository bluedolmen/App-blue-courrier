///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	Yamma.Actions.GenericTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		authenticatedUserName : Utils.Alfresco.getFullyAuthenticatedUserName(),
				
//		prepare : function() {
//			
//			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);
//						
//		},		
		
		doExecute : function(task) {

			task.endTask(this.action);
				
		}

	});
	
	Yamma.Actions.GenericTaskAction.execute();
	
})();