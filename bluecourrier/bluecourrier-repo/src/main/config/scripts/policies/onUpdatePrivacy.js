///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/privacy-utils.js">

(function() {

	var
		bargs = behaviour.getArgs(),
		documentNode = bargs[0],
		afterProperties = bargs[2]
	;
	
	if (null == documentNode || !documentNode.exists()) return;
	
	// MAIN
	
	main();
	
	function main() {
		
		var level = afterProperties[YammaModel.PRIVACY_PRIVACY_LEVEL_PROPNAME];
		
		// executed as admin
		PrivacyUtils.updatePermissions(documentNode, level);
			
	}
	
})();
