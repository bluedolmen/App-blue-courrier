///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var 
		document = BPMUtils.getFirstPackageResource()
	;
	
	Yamma.DeliveryUtils.updateServiceShare(document, 'done');
	Yamma.DeliveryUtils.checkAddedShares();

})();