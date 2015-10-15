///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var document = BPMUtils.getFirstPackageResource();
	if (null == document) return;
	
	DocumentUtils.setDocumentState(document, 'processed');
	
})();