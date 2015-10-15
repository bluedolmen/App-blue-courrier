///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var assignTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		taskName : 'bcinwf:deliveringTask',
		assignee : null,
				
		wsArguments : [
			'assignee'
		],
		
		prepare : function() {
			
			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);
			
			this.assignee = Utils.wrapString(this.parseArgs['assignee']);
			
		},
		
		doExecute : function(task) {
			
			workflowUtils.updateTaskProperties(task, {
				'bcinwf:instructor' : this.assignee
			});
			
			task.endTask('Assign');					
			
		}
		
	});

	assignTaskAction.execute();
	
})();
