///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		owner = Utils.wrapString(task.assignee),
		validatingOutcome = Utils.asString(task.getVariable('bcogwf_validatingOutcome'))
	;
	
	if (owner) {
		updateValidationHistory();			
	}
	
	updateHistory();
	
	BPMUtils.copyTaskVariablesToExecution([
   	    'bcogwf_validationChain',
	    'bcogwf_signingActor'   	    
//   	    'bcogwf_validationHistory' // Execution is set by updateValidationHistory
   	]);
	
	function updateValidationHistory() {
		
		var validationHistory = Utils.toArray(BPMUtils.getContextVariable('bcogwf_validationHistory') || []);
		validationHistory.push(owner + '|' + validatingOutcome);
		execution.setVariable('bcogwf_validationHistory', workflowUtils.toJavaCollection(validationHistory)); // Activiti/Alfresco does not wrap native Javascript arrays
		
	}
	
	function updateHistory() {
		
		var args = [], comment, validationChain, taskValidationChain, extraMessage = '';
		
		comment = Utils.asString(task.getVariable('bpm_comment'));
		args.push(comment ? ': ' + comment : '');
		
		validationChain = Utils.toArray(execution.getVariable('bcogwf_validationChain'));
		taskValidationChain = Utils.toArray(task.getVariable('bcogwf_validationChain'));
		
		if (Utils.asString(validationChain) != Utils.asString(taskValidationChain)) { // Q&D test
			extraMessage = '\n';
			extraMessage += Utils.Alfresco.getMessage(
				'yamma.actions.validation.chain',
				[
					( Utils.Array.map(Utils.toArray(taskValidationChain), function(authority) {
						return Utils.Alfresco.getPersonDisplayName(authority);
					}).join(',') || 'Aucun' )
				]
			);
		}
		args.push(extraMessage);
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'validation!' + ('Reject' == validatingOutcome ? 'reject' : 'accept'),
			key : 'yamma.actions.completeValidatingProcessed.' + validatingOutcome + '.comment',
			args : args
			
		});
		
	}
	
})();