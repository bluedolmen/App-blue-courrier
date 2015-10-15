///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/init/init-utils.lib.js">

(function() {
	
	var 
		parseArgs = new ParseArgs({ name : 'action', mandatory : true}, 'redirect'),
		registeredInitDefinitions = bdInitHelper.getRegisteredInitDefinitions(),
		mappedInitDefinitions = Utils.ArrayToMap(registeredInitDefinitions, function(initDef) {return initDef.id}), 
		initId = url.templateArgs.initId,
		initDefinition = mappedInitDefinitions[initId],
		actionId = parseArgs['action'],
		redirect = parseArgs['redirect']
	;
	
	if (null == initDefinition) {
		status.setCode(Status.STATUS_NOT_FOUND);
		status.setMessage("Cannot find a valid definition for initialization '" + initId + "'");
		return;
	}
	
	if (null == actionId) {
		status.setCode(Status.STATUS_NOT_FOUND);
		status.setMessage("Cannot find a valid action identifier in the provided parameters (pattern action_{actionId})");
		return;
	}
	
	var actionFunction = initDefinition[actionId];
	if (null == actionFunction) {
		status.setCode(Status.STATUS_NOT_FOUND);
		status.setMessage("Cannot find a valid function definition for initialization '" + initId + "' and action '" + actionId + "'");
		return;
	}
	
	actionFunction.call(initDefinition, json); // leave the scope on initDefinition
	
	if (null != redirect) {
		status.setCode(Status.STATUS_MOVED_PERMANENTLY);
		status.setRedirect(true);
		status.setLocation(redirect);
	}

	model.actionStatus = 'success';
	model.state = initDefinition.checkInstalled();
	
})();