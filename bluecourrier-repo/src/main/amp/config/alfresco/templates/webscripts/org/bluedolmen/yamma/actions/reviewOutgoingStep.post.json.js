///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/reviewOutgoing.lib.js">

(function() {
	
	Yamma.Actions.ReviewOutgoingStepTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		taskName : 'bcwfoutgoing:Validating',
		
		validationChain : null,
		signingActor : null,
		action : 'Next',
		comment : null,
		
		wsArguments : [

			{ name : 'action', defaultValue : 'Next' }, 
			{ name : 'validationChain', checkValue : checkActorsChain },
			{ name : 'signingActor', checkValue : checkSigningActor },
			{ name : 'comment' }

		],
		
		prepare : function() {

			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);

			this.validationChain = Utils.asString(this.parseArgs['validationChain']);
			this.signingActor = Utils.wrapString(this.parseArgs['signingActor']);
			this.action = Utils.asString(this.parseArgs['action']);
			this.comment = Utils.asString(this.parseArgs['comment']);

		},		
		
		doExecute : function(task) {

			workflowUtils.updateTaskProperties(task, {
				'bcogwf:validationChain' : Utils.String.splitToTrimmedStringArray(this.validationChain),
				'bcogwf:signingActor' : this.signingActor, // may be empty to be removed
				'bpm:comment' : this.comment
			});
			
			task.endTask(this.action);

		}
	
	});

	Yamma.Actions.ReviewOutgoingStepTaskAction.execute();
	
})();