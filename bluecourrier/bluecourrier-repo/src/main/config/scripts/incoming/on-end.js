///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
(function() {
	
	var
		document = BPMUtils.getFirstPackageResource()
	;
	
	if (null == document) return;
	
	// Clean-up residual properties
	bdNodeUtils.removeProperty(document, 'bcinwf:lastProcessingServiceChange');
	bdNodeUtils.removeProperty(document, 'bcinwf:instructorUserName');
	
})();