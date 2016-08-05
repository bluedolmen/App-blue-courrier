///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/directory-utils.js">

(function() {

	// CHECKINGS
	
	var association = behaviour.args[0];
	if ('undefined' == typeof association) {
		logger.warn('[onAssociateOrganization] Cannot find any association reference.');
		return;
	}	
	
	// MAIN VARIABLES
	
	var 
		documentNode = association.getSource(),
		organizationEntry = association.getTarget()
	;
	if (null == documentNode || null == organizationEntry) return;
	
	// MAIN
	
	main();
	
	function main() {
		
		DirectoryUtils.fillRecipientOrganization(organizationEntry, documentNode);
		
	}
	
})();
