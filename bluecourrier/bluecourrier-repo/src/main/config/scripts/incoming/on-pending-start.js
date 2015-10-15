///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var
		serviceName, serviceRole,
		document = Utils.Alfresco.BPM.getFirstPackageResource()
	;
	
	function setServiceAndRole() {
		
		var 
			document = BPMUtils.getFirstPackageResource()
		;
		
		if (null == document) return;
		
		// Set service and role
		serviceName = Utils.Alfresco.getEnclosingSiteName(document);
		if (!ServicesUtils.isService(serviceName)) {
			throw new Error("IllegalStateException! Service '" + serviceName + "' is not a valid service");
		}
		
		serviceRole = Yamma.DeliveryUtils.ROLE_PROCESSING; // Default role while in pending state
		
		if (ServicesUtils.isService(serviceName)) {
			serviceAndRole = Yamma.DeliveryUtils.encodeServiceAndRole(serviceName, serviceRole); 
		}
		
		execution.setVariableLocal('serviceAndRole', serviceAndRole);
		
	}
	
	setServiceAndRole();
	
	BPMUtils.copyExecutionVariablesToTask([
  	    'bcinwf_validateDelivering',
   	    'bcinwf_processKind',
   	    'bcinwf_shares'
    ]);
	
	task.setVariableLocal('bcinwf_serviceName', serviceName);
	task.setVariableLocal('bcinwf_serviceRole', serviceRole);
	
})();
