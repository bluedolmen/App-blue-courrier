///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	// CHECKINGS
	
	var association = behaviour.args[0];
	if ('undefined' == typeof association) {
		logger.warn('[onUpdateDelay] Cannot find any association reference.');
		return;
	}	
	
	// MAIN VARIABLES
	
	var documentNode = association.getSource();
	if (null == documentNode) return;
	
	throw new Error("Deprecated! This code is deprecated!");
	// Will work either on create or delete
	var delayNode = (documentNode.assocs[YammaModel.DUEABLE_DELAY_ASSOCNAME] || [])[0];
	
	DueableUtils.updateDueDate(documentNode, delayNode);
	
})();
