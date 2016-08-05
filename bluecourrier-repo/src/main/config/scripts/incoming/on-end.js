///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
(function() {
	
	var
		document = BPMUtils.getFirstPackageResource()
	;
	
	if (null == document) return;
	
	// Clean-up residual properties
	bdNodeUtils.removeProperty(document, 'bcinwf:lastProcessingServiceChange');
	
	// May be useful for workflow restart if no other option is available
	bdNodeUtils.removeProperty(document, 'bcinwf:instructorUserName');
	
})();