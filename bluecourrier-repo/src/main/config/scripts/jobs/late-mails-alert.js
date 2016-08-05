///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var
		active = 'true' == Utils.asString(bluecourrierConfig.getValue('jobs.late-mails.active')).toLowerCase(),
		daysNumberLeft = Number(bluecourrierConfig.getValue('jobs.late-mails.days-nb-left') || 0)
	;
	
	if (!active) return;
	
	Utils.forEach(ServicesUtils.getManagedServices(), function(service) {
		processService(service);
	});
	
	function processService(service) {
		
		var 
			serviceName = Utils.asString(service.shortName),
			mails = DueableUtils.getLateMails(daysNumberLeft, serviceName),
			managerUsers
		;

		if (Utils.Array.isEmpty(mails)) return;
		
		managerUsers = ServicesUtils.getServiceRoleMembers(serviceName, ServicesUtils.SERVICE_MANAGER_ROLENAME);
		
		Utils.Array.forEach(managerUsers, function(user) {
			
			var recipientEmail = Utils.asString(user.properties['cm:email']);
			if (!recipientEmail) return;
			
			SendMailUtils.sendMail({
				
				recipientEmail : recipientEmail,
				templateDefinition : Utils.Object.create(DueableUtils.LATE_TEMPLATE, {
					serviceName : serviceName,
					userDisplayName : Utils.Alfresco.getPersonDisplayName(user),
					mails : mails
				}),
				document : mails[0], // The sending of Alfresco mail is relative to a document, we take the first mail arbitrarily
				silent : true
				
			});
			
		});
		
	}
	
})();
