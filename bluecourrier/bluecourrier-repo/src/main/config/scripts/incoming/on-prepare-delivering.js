///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">
(function() {

	/*
	 * This is made outside the task scope to enable the variable to be set on
	 * the nearest concurrent execution context. Else it is necessary to set the
	 * variable on the parent context which is not necessarily immediate for a
	 * clear understanding.
	 */

	var 
		serviceAndRole = Yamma.DeliveryUtils.getCurrentBPMServiceAndRole(), serviceName = serviceAndRole.name
			|| Yamma.DeliveryUtils.getBPMContextualServiceName(), serviceRole = serviceAndRole.role
			|| Yamma.DeliveryUtils.ROLE_INFORMATION, slashIndex = serviceRole
			.indexOf('/'),
			
		node
	;

	if (!ServicesUtils.isService(serviceName)) {
		throw new Error("IllegalStateException! Service '" + serviceName + "' is not a valid service");
	}

	if (-1 != slashIndex) {
		serviceRole = serviceRole.substring(0, slashIndex);
	}

	Yamma.DeliveryUtils.checkRoleIsValid(serviceRole);

	execution.setVariableLocal('serviceName', serviceName);
	execution.setVariableLocal('serviceRole', serviceRole);
	
	// // Reset the shares variables only for this path of execution
	// execution.setVariable('bcinwf_shares','');

})();
