///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {

	var
		document = BPMUtils.getFirstPackageResource(),
		serviceName = Utils.asString(BPMUtils.getContextVariable('serviceName')),
		serviceRole = Utils.asString(BPMUtils.getContextVariable('serviceRole'))
	;
	
	switch(serviceRole) {
	
	case Yamma.DeliveryUtils.ROLE_PROCESSING:
	case Yamma.DeliveryUtils.ROLE_PROCESSING + '/to':
		processProcessingService();
		break;
		
	case Yamma.DeliveryUtils.ROLE_COLLABORATION:
	case Yamma.DeliveryUtils.ROLE_COLLABORATION + '/to':
		processCollaborationService();
		break;
		
	case Yamma.DeliveryUtils.ROLE_INFORMATION:
		processInformationService();
		break;
	}
	
	function processProcessingService() {
		Yamma.DeliveryUtils.deliverToService(document, serviceName, {checkExisting : false});
	}
	
	function processCollaborationService() {
		Yamma.DeliveryUtils.shareWithCollaborationService(document, serviceName, {checkExisting : false});
	}
	
	function processInformationService() {
		Yamma.DeliveryUtils.shareWithInformationService(document, serviceName, {checkExisting : false});
	}
	
})();