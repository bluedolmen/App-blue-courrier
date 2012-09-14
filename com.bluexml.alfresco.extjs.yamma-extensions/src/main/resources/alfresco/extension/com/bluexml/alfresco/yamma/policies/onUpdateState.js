///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	// CHECKINGS
	
	var
		bargs = behaviour.getArgs(),
		documentNode = bargs[0],
		beforeProperties = bargs[1],
		beforeState = Utils.asString(beforeProperties.get(YammaModel.STATUSABLE_STATE_PROPNAME)),
		afterProperties = bargs[2],
		afterState = Utils.asString(afterProperties.get(YammaModel.STATUSABLE_STATE_PROPNAME))
	;
	
	if (beforeState === afterState) return;
		
	// MAIN
	
	main();
	
	function main() {
		logger.warn('[onUpdateSite] The state of the document was updated from ' + beforeState + ' to ' + afterState);	
	}
	
	
})();
