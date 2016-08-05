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
		
		var 
			rawAutomaticFollowing = bluecourrierConfig.getValue('wf.incoming.automatic-following'),
			automaticFollowing = Utils.asString(rawAutomaticFollowing).toLowerCase(),
			followingUsers, serviceName
		;
		
		if ('false' == automaticFollowing) return;
		if ('Deliver' != deliveringOutcome) return;
		
		if ('true' == automaticFollowing || 'user' == automaticFollowing) {
			FollowingUtils.follow(document);
		}
		else if (Utils.String.startsWith(rawAutomaticFollowing, 'Service')) {
			serviceName = BPMUtils.getContextVariable('serviceName');
			// Manage a Service group
			followingUsers = ServicesUtils.getServiceRoleMembers(serviceName, rawAutomaticFollowing);
		}
		
		if (followingUsers) {
			Utils.forEach(followingUsers, function(followingUser) {
				
				var userName = Utils.asString(followingUser.properties['userName']);
				if (!userName) return;

				FollowingUtils.follow(document, userName);
				
			});
		}
		
		
	}
	
	                               	
})();