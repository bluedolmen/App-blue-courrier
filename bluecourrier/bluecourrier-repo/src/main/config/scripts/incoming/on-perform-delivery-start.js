///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var 
		document = BPMUtils.getFirstPackageResource(),
		currentShares = Yamma.DeliveryUtils.getCurrentShares(document),
		addedShares = Yamma.DeliveryUtils.getAddedShares(document),
		addedServices, serviceAndRoles,
		
		currentServiceRole = Utils.asString(BPMUtils.getContextVariable('serviceRole')),
		currentServiceName = Utils.asString(BPMUtils.getContextVariable('serviceName')),
		
		replacingTargetService = null != currentServiceRole ? 
				addedShares.getServicesBy(function accept(service) {
				return (service.role == currentServiceRole + '/to');
			})[0]
			: null
	;
	
	if (null == replacingTargetService) {
		addedShares.add({services : [{name : currentServiceName, role : currentServiceRole}]});
	}
	else if (Yamma.DeliveryUtils.ROLE_PROCESSING == currentServiceRole) {
		// Transfer processing => save this piece of information
		// USE a transient property (this property is not defined in the model)
		document.properties['bcinwf:lastProcessingServiceChange'] = new Date();
		document.save();
	}
	
	addedServices = addedShares.services;
	serviceAndRoles = Utils.Array.map(addedServices, function(service) {
//		logger.warn('[*] ' + service.name + ' -> ' + service.role);
		return service.name + '|' + Yamma.DeliveryUtils.getActualRole(service.role);
	});
	
	if (Utils.Array.isEmpty(serviceAndRoles)) {
		throw new Error('IllegalStateException! There is no service defined at this point');
	}
	
	currentShares.add(addedShares, true /* checkExisting */, { status : 'assigned' });
	currentShares.store(document);
			
	execution.setVariable('serviceAndRoles', workflowUtils.toJavaCollection(serviceAndRoles)); // Activiti/Alfresco does not wrap native Javascript arrays 
	
})();