///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var 
		document = BPMUtils.getFirstPackageResource(),
		deliveringOutcome = Utils.asString(task.getVariable('bcinwf_deliveringOutcome'))
	;
	
	BPMUtils.copyTaskVariablesToExecution([
  	    'bcinwf_validateDelivering',
  	    'bcinwf_shares',
  	    'bcinwf_instructor'
  	]);
	
	addHistoryEvent();
	addFollowing();
	
	function addHistoryEvent() {
		
		var 
			args,
			serviceRole, instructorName,
			addedShares, validateDelivering
		;

		serviceRole = BPMUtils.getContextVariable('serviceRole') || '';
		if (serviceRole) {
			serviceRole = Yamma.DeliveryUtils.getActualRole(serviceRole);
			serviceRole = Yamma.DeliveryUtils.ROLE_LABELS[serviceRole] || 'inconnu';
		}
		
		if ('Deliver' == deliveringOutcome) {
			validateDelivering = task.getVariable('bcinwf_validateDelivering');
			if (true == validateDelivering) deliveringOutcome = 'Validate';
			
			addedShares = Yamma.DeliveryUtils.getBPMStoredShares(task).toString() || '';
			args = [addedShares];
			
		}
		else if ('Assign' == deliveringOutcome) {
			
			instructorName = Utils.asString(task.getVariable('bcinwf_instructor'));
			instructorName = Utils.Alfresco.getPersonDisplayName(instructorName);
			
			args = [serviceRole, instructorName];
			
		}
		else if ('Done' == deliveringOutcome) {
			
			args = [serviceRole]; 
			
		}
		
		HistoryUtils.addEvent(document, {
			
			eventType : 'completeDelivering',
			key : 'yamma.actions.completeDelivering.' + deliveringOutcome + '.comment',
			args : args
			
		});
		
	}
	
	function addFollowing() {
		
		var automaticFollowing = Utils.asString(bluecourrierConfig.getValue('wf.incoming.automatic-following')).toLowerCase();
		if ('false' == automaticFollowing) return;
		if ('Deliver' != deliveringOutcome) return;
		
		FollowingUtils.follow(document);
		
	}
	
	                               	
})();