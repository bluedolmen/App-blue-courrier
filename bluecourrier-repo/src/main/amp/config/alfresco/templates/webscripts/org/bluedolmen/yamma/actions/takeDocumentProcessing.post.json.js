///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/taskStart.lib.js">

(function() {
	
	Yamma.Actions.TakeProcessingAction = Utils.Object.create(Yamma.Actions.TaskStartAction, {
		
		doExecute : function(task) {

			Yamma.Actions.TaskStartAction.doExecute.call(this, task);
			
			// Also update the history
			
			HistoryUtils.addEvent(this.node, {
				eventType : 'startProcessing',
				key : 'yamma.actions.startProcessing.comment'
			});
			
		}
		
	});

	Yamma.Actions.TakeProcessingAction.execute();
	
})();