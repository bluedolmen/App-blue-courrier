///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/init/init-utils.lib.js">

(function() {
	
	var 
		registeredInitDefinitions = sideInitHelper.getRegisteredInitDefinitions(),
		statuses = []
	;
	
	Utils.forEach(registeredInitDefinitions, function(initDef) {
		
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