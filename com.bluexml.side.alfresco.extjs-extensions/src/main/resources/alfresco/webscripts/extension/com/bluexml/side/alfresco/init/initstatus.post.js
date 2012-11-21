<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/init/init-utils.lib.js">

(function() {
	
	var 
		registeredInitDefinitions = sideInitHelper.getRegisteredInitDefinitions(),
		mappedInitDefinitions = Utils.ArrayToMap(registeredInitDefinitions, function(initDef) {return initDef.id}), 
		initId = url.templateArgs.initId,
		initDefinition = mappedInitDefinitions[initId],
		actionId = getActionId(),
		redirect = args['redirect']
	;
	
	if (null == initDefinition) {
		status.code = 400;
		status.message = "Cannot find a valid definition for initialization '" + initId + "'";
		return;
	}
	
	if (null == actionId) {
		status.code = 500;
		status.message = "Cannot find a valid action identifier in the provided parameters (pattern action_{actionId})";
		return;
	}
	
	var actionFunction = initDefinition[actionId];
	if (null == actionFunction) {
		status.code = 500;
		status.message = "Cannot find a valid function definition for initialization '" + initId + "' and action '" + actionId + "'";
		return;
	}
	
	actionFunction.call(initDefinition, args); // leave the scope on initDefinition
	
	if (null != redirect) {
		status.code = 301;
		status.location = redirect;
	}
	
	
	function getActionId() {
		var matching;
		
		for (var key in args) {
			matching = /^action_(.*)$/.exec(key);
			if (matching) return matching[1];
		}
		
		return null;
	}
	
})();