///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/reviewOutgoing.lib.js">

(function() {
	
	Yamma.Actions.ReviewOutgoingStepTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		taskName : 'bcwfoutgoing:Validating',
		
		validationChain : null,
		action : 'Next',
		comment : null,
		
		wsArguments : [

			{ name : 'action', defaultValue : 'Next' }, 
			{ name : 'validationChain', checkValue : checkActorsChain },
			{ name : 'comment' }

		],
		
		prepare : function() {

			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);

			this.validationChain = Utils.asString(this.parseArgs['validationChain']);
			this.action = Utils.asString(this.parseArgs['action']);
			this.comment = Utils.asString(this.parseArgs['comment']);

		},		
		
		doExecute : function(task) {

			workflowUtils.updateTaskProperties(task, {
				'bcogwf:validationChain' : Utils.String.splitToTrimmedStringArray(this.validationChain),
				'bpm:comment' : this.comment
			});

			task.endTask(this.action);

		}
	
	});

	Yamma.Actions.ReviewOutgoingStepTaskAction.execute();
	
})();