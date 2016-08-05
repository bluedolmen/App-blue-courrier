///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var 
		document = Utils.Alfresco.BPM.getFirstPackageResource(),
		certifyingOutcome = Utils.asString(task.getVariable('bcogwf_certifyingOutcome')),
		signingActor = Utils.asString(execution.getVariable('bcogwf_signingActor')),
		signingRole = Utils.asString(execution.getVariable('bcogwf_signingRole')),
		signingChain = Utils.toArray(BPMUtils.getContextVariable('bcogwf_signingChain') || []),
		signingHistory = Utils.toArray(BPMUtils.getContextVariable('bcogwf_signingHistory') || []),
		nextActor
	;
	
	if ('approval' == signingChain) {
		signingChain = signingChain.slice(1);
	}

	// The signing chain is normally provided by the user
//	if ('certification' == signingRole) {
//		
//		var validationHistory = Utils.toArray(BPMUtils.getContextVariable('bcogwf_validationHistory') || []);
//		signingChain = Utils.Array.map(validationHistory, function(validationStep) {
//			validationStep = Utils.asString(validationStep).split('|');
//			var userName = validationStep[0];
//			if (userName != signingActor) return userName;
//		});
//	}
	
	signingHistory.push(signingActor + '|' + signingRole);
	execution.setVariableLocal('bcogwf_signingHistory',  workflowUtils.toJavaCollection(signingHistory));
	execution.setVariableLocal('bcogwf_signingChain', workflowUtils.toJavaCollection(signingChain));
	
	nextActor = signingChain[0] || null;
	execution.setVariableLocal('bcogwf_signingRole', 'approval');
	execution.setVariableLocal('bcogwf_signingActor', nextActor);
	

	// Removed => Reverting causes losing of outboundDocument aspect (unexplained yet)
//	if ('Reject' == certifyingOutcome) {
//
//		document = revertDocument();
//
//	}
	
	addHistoryEvent();
	
	function addHistoryEvent() {
		
		var args = [], comment, signingChain, taskSigningChain, extraMessage = '';
		
		comment = Utils.asString(task.getVariable('bpm_comment'));
		args.push(comment ? ': ' + comment : '');
		
		signingChain = Utils.toArray(execution.getVariable('bcogwf_signingChain'));
		taskSigningChain = Utils.toArray(task.getVariable('bcogwf_signingChain'));
		
		if (Utils.asString(signingChain) != Utils.asString(taskSigningChain)) { // Q&D test
			extraMessage = '\n';
			extraMessage += Utils.Alfresco.getMessage(
				'yamma.actions.approval.chain',
				[
				 	( Utils.Array.map(Utils.toArray(taskSigningChain), function(authority) {
						return Utils.Alfresco.getPersonDisplayName(authority);
					}).join(',') || 'Aucun' )
				]
			);
		}
		args.push(extraMessage);
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'signing!' + ('approval' == signingRole && 'Certify' == certifyingOutcome ? 'approve' : certifyingOutcome.toLowerCase()),
			key : 'yamma.actions.completeCertifying.' + signingRole + '.' + certifyingOutcome + '.comment',
			args : args
			
		});
		
	}
	
	function revertDocument(document) {
		
		var
			unsignedVersion,
			history = ''
		;
		
		unsignedVersion = findLastUnsignedVersion(document);
	
		if (null != unsignedVersion) {
			history = Utils.Alfresco.getMessage('yamma.actions.completeCertifying.approval.Reject.comment', ['']);
			document.revert(history, false /* major */, Utils.asString(unsignedVersion.getLabel()));
		}
	
		function findLastUnsignedVersion(document) {
			
			var versions = document.getVersionHistory();
			
			return Utils.Array.first(versions, function(version) {
				var node = version.getNode();
				return !node.hasAspect('ds:signed');
			});
			
		}
		
		
	}
	
	
})();