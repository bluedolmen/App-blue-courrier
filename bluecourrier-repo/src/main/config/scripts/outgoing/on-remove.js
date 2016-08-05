///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	var outgoingDocument = Utils.Alfresco.BPM.getFirstPackageResource();
	if (null == outgoingDocument) return;
	
	ReplyUtils.removeReply(outgoingDocument);
	
})();
