///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	// CHECKINGS
	
	var association = behaviour.args[0];
	if ('undefined' == typeof association) {
		logger.warn('[onUpdateAssignable] Cannot find any association reference.');
		return;
	}	
	
	// MAIN VARIABLES
	
	var 
		documentNode = association.getSource(),
		personNode = association.getTarget()
	;
	if (null == documentNode || null == personNode) return;
	
	// MAIN
	
	main();
	
	function main() {
		var personName = Utils.Alfresco.getPersonUserName(personNode);
		if (!personName) return;
		
		documentNode.properties[YammaModel.ASSIGNABLE_AUTHORITY_PROPNAME] = personName;
		documentNode.save();
	}
	
})();
