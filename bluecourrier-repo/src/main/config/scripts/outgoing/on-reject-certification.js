///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	

	// Do not do anything here, it leads to an optimistic exception due to a
	// concurrent modification of the document
	return; 
	
//	var
//		document = Utils.Alfresco.BPM.getFirstPackageResource(),
//		unsignedVersion,
//		signingActor = Utils.asString(execution.getVariable('bcogwf_signingActor')),
//		history = ''
//	;
//	
//	unsignedVersion = findLastUnsignedVersion(document);
//
//	if (null != unsignedVersion) {
//		history = Utils.Alfresco.getMessage('yamma.actions.completeCertifying.approval.Reject.comment', ['']);
//		document.revert(history, false /* major */, Utils.asString(unsignedVersion.getLabel()));
//	}
//
//	function findLastUnsignedVersion(document) {
//		
//		var versions = document.getVersionHistory();
//		
//		return Utils.Array.first(versions, function(version) {
//			var node = version.getNode();
//			return !node.hasAspect('ds:signed');
//		});
//		
//	}
	
})();
