///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/init/init-utils.lib.js">

(function() {
	
	var 
		registeredInitDefinitions = sideInitHelper.getRegisteredInitDefinitions(),
		siteList = siteService.listSites('',''),
		bySiteInitDefinitions = Utils.filter(regiteredInitDefinitions,
			function accept(initDefinition) {
				return Utils.isFunction(initDefinition.initSite);
			}
		),
		statuses = {}
	;
	
	Utils.forEach(siteList, function(site) {
		
		var siteName = site.shortName;
		statuses[siteName] = [];
		
		Utils.forEach(bySiteInitDefinitions, function(initDef) {
			
			var 
				
				installationState = initDef.checkSiteInstalled(site),
				details = initDef.getSiteDetails ? initDef.getSiteDetails(site) : '',
				actions = []
			;
			
			if (
				Init.InstallationStates.FULL != installationState && 
				Init.InstallationStates.MODIFIED != installationState
			) {
				actions.push({
					id : 'execute',
					title : 'Install',
					url : 'bluexml/init/execute/' + initDef.id	+ '/' + initDef.getSiteName(site)
				});
			}
			
			if ( 
				(
					Init.InstallationStates.PARTIALLY == installationState || 
					Init.InstallationStates.MODIFIED == installationState
				) && 
				(null != initDef.reset) 
			) {
				actions.push({
					id : 'reset',
					title : 'Reset',
					url : 'bluexml/init/reset/' + initDef.id + '/' + initDef.getSiteName(site)
				});
			}
			
			statuses[siteName].push({
			
				id : initDef.id,
				state : installationState,
				details : details,
				actions : actions
				
			});
			
		});
		
	});
	
	model.statuses = statuses;
	
})();