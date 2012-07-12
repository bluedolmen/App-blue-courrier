///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	// CHECKINGS
	
	var association = behaviour.args[0];
	if ('undefined' == typeof association) {
		logger.warn('[onUpdateDelay] Cannot find any association reference.');
		return;
	}	
	
	// MAIN VARIABLES
	
	var documentNode = association.getSource();;
	var delayNode = association.getTarget();
	if (!documentNode || !delayNode) return;
	
	// MAIN
	
	main();
	
	function main() {
		PriorityUtils.updateDueDate(documentNode, delayNode);
	}
	
	
})();
