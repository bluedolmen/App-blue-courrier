///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/init/init-utils.lib.js">

(function() {

	var 
		initDefinitions = bdInitHelper.getRegisteredInitDefinitions(),
		initId = url.templateArgs.initId,
		statuses = []
	;
	
	if (null != initId) {
		
		var
			mappedInitDefinitions = Utils.ArrayToMap(initDefinitions, function(initDef) {return initDef.id}), 
			initDefinition = mappedInitDefinitions[initId]
		;
		
		if (null == initDefinition) {
			status.code = 400;
			status.message = "Cannot find a valid definition for initialization '" + initId + "'";
			return;
		}
		
		initDefinitions = [initDefinition];
		
	}
	
	Utils.forEach(initDefinitions, function(initDef) {
		
		var 
			installationState = initDef.checkInstalled(),
			details = initDef.getDetails ? initDef.getDetails() : '',
			actions = []
		;
		
		if (
			Init.InstallationStates.FULL != installationState && 
			Init.InstallationStates.MODIFIED != installationState &&
			null != initDef.init
		) {
			actions.push({
				id : 'init',
				title : 'Install'
			});
		}
		
		if ( 
			(
				Init.InstallationStates.PARTIALLY == installationState || 
				Init.InstallationStates.MODIFIED == installationState
			) && 
			null != initDef.reset 
		) {
			actions.push({
				id : 'reset',
				title : 'Reset'
			});
		}
		
		if (
			Init.InstallationStates.NO != installationState && 
			null != initDef.clear
		) {
			actions.push({
				id : 'clear',
				title : 'Remove'
			});
		}
		
		statuses.push({
		
			id : initDef.id,
			state : installationState,
			details : details,
			actions : actions
			
		});
		
	});
	
	model.statuses = statuses;
	
})();