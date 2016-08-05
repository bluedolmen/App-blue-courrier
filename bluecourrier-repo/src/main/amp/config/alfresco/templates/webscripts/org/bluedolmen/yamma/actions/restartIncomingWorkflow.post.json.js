///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/inmail-utils.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	var 
		fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName()
	;
	
	/**
	 * The incoming-document workflow is launchable if :
	 * - There is no incoming-document workflow currently running
	 * - Either the assistant of the service 
	 * - or an application administrator
	 * 
	 */
	function isIncomingDocumentWorkflowLaunchable(node, userName) {
		
		if (null == node) return false;
		userName = userName || fullyAuthenticatedUserName;
		
		if (!DocumentUtils.isDocumentNode(node) || !node.hasAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME)) {
			return "The provided node is not a incoming document-node";
		}

		if (incomingWorkflowHelper.isAcceptingDelivery(node)) {
			return 'The incoming workflow is already started';
		}
		
		var enclosingServiceName = Utils.Alfresco.getEnclosingSiteName(node);
		if (enclosingServiceName) {
			if (ServicesUtils.isServiceAssistant(enclosingServiceName, userName)) return true;
		}
		
		if (yammaHelper.isApplicationAdministrator(userName)) return true;
		
		return 'You need to be either a Service Assistant or an application administrator';
		
	}
	
	var restartIncomingAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		isExecutable : function(node) {
			
			return isIncomingDocumentWorkflowLaunchable(node);
			
		},
		
		doExecute : function(node) {
			
			var enclosingServiceName = Utils.Alfresco.getEnclosingSiteName(node);
			
			Yamma.DeliveryUtils.startIncomingWorkflow(
				node, 
				false /* validateDelivering is not relevant */, 
				{
					processKind : node.properties["bluecourrier:processKind"],
					'serviceAndRole' : enclosingServiceName + '|' + Yamma.DeliveryUtils.ROLE_PROCESSING,
					'bcinwf:startingMode' : 'delivering'
				} /* extraParameters */
			);
			
		}
		
	});
	
	restartIncomingAction.execute();	
	
})();