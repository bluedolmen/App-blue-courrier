///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var document = BPMUtils.getFirstPackageResource();
	if (null == document) return;
	
	DocumentUtils.setDocumentState(document, 'processed');
	
	HistoryUtils.addEvent(document, {
		eventType : 'sent-outbound', 
		key : 'yamma.actions.markAsSent.comment'
	});
	
})();