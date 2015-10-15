///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var
		serviceName = BPMUtils.getContextVariable('serviceName'),
		serviceRole = BPMUtils.getContextVariable('serviceRole'),
		document = BPMUtils.getFirstPackageResource()
	;
	
	if (!ServicesUtils.isService(serviceName)) {
		throw new Error("IllegalStateException! [X]Service '" + serviceName + "' is not a valid service");
	}
	
	if (null != document) {
		Yamma.DeliveryUtils.updateServiceShare(document, 'ongoing', serviceName, serviceRole);
	}
	
	BPMUtils.copyExecutionVariablesToTask([
  	    'bcinwf_validateDelivering',
   	    'bcinwf_processKind',
   	    'bcinwf_shares',
   	    {
  	    	'serviceName': 'bcinwf_serviceName',
  	    	'serviceRole': 'bcinwf_serviceRole'
   	    }
    ]);	
	
})();
