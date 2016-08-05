///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		processingOutcome = Utils.asString(task.getVariable('bcogwf_processingOutcome'))
	;
	
	BPMUtils.copyTaskVariablesToExecution([
	    'bcogwf_validationChain',
	    'bcogwf_signingActor'
	]);
	
	addHistoryEvent();
	
	
	function addHistoryEvent() {
		
		var 
			args = [], extraMessage,
			taskValidationChain = Utils.toArray(task.getVariable('bcogwf_validationChain'))
//			signingActor = Utils.asString(task.getVariable('bcogwf_signingActor')) // Maybe used to indicate certification affectation 
		;

		if ('Validate' == processingOutcome) {
			
			extraMessage = '\n' + Utils.Alfresco.getMessage(
				'yamma.actions.validation.chain',
				[( Utils.Array.map(taskValidationChain, function(authority) {
					return Utils.Alfresco.getPersonDisplayName(authority);
				}).join(',') || 'Aucun' )]
			);
			
			args.push(extraMessage);
			
		}
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'completeOutgoingProcessing',
			key : 'yamma.actions.completeProcessing.' + processingOutcome + '.comment',
			args : args
			
		});
		
	}
	
	
})();