///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	BPMUtils.copyTaskVariablesToExecution([
  	    'bcinwf_shares'
  	]);
	
	execution.setVariable('bcinwf_validateDelivering', false); // Should be made according to a configuration value
	
	addHistoryEvent();
	
	
	function addHistoryEvent() {
		
		var 
			document = BPMUtils.getFirstPackageResource(),
			validatingOutcome = Utils.asString(task.getVariable('bcinwf_validatingOutcome')),
			args,
			addedShares = Yamma.DeliveryUtils.getBPMStoredShares(task).toString() || '';
		;
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'completeValidating',
			key : 'yamma.actions.completeValidating.' + validatingOutcome + '.comment',
			args : [addedShares]
			
		});
		
	}

	                               	
})();