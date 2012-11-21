function creatSiteArchives() {
	
}

Init.Utils.register(creatSiteArchives, 20);

(function() {

	var sitesArchives = Utils.Object.create(Init.InitDefinition, {
		
		id : 'sites-archives',
		level : 20,
		
		initSite : function(siteName) {
			
			if (YammaUtils.isConfigSite(siteName)) return; // do not create trays in the admin site
			logger.log("Checking site '" + siteName + "' for archives structure...");
			
			var 
				siteNode = Utils.Alfresco.getSiteNode(siteName),
				archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
			;
			if (null == archivesContainer) return; // already created
			
			ArchivesUtils.createArchivesFolder(siteNode);
			
		},
		
		clearSite : function(siteName) {
			var
				siteNode = Utils.Alfresco.getSiteNode(siteName),
				archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
			;
			
			if (null == archivesContainer) return; // skip site
			archivesContainer.remove();
		},
		
		checkInstalled : function() {
			var
				sitesMap = Utils.arrayToMap(siteService.listSites(null, null), function(site) { return site.shortName; }),
				present = []
				missing = []
			;		

			for (var siteName in sitesMap) {
				if (YammaUtils.isConfigSite(siteName)) continue;
				var
					siteNode = sitesMap[siteName].getNode(),
					archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
				;
				
				if (archivesContainer) {
					present.push(siteName);
				} else {
					missing.push(siteName);
				}
			}
			
			if (!Utils.isArrayEmpty(missing)) {
				if (Utils.isArrayEmpty(present)) {
					return Init.InstallationStates.NO;
				} else {
					return Init.InstallationStates.PARTIALLY;
				}
			}
			
			return Init.InstallationStates.FULL;
		},
		
		getDetails : function() {
			var
				output = '',
				sitesMap = Utils.arrayToMap(siteService.listSites(null, null), function(site) { return site.shortName; })
			;		

			for (var siteName in sitesMap) {
				if (YammaUtils.isConfigSite(siteName)) continue;
				
				var
					siteNode = sitesMap[siteName].getNode(),
					archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
				;
				
				if (archivesContainer) {
					output += '[OK] ' + siteName + '\n';
				} else {
					output += '[MISSING] ' + siteName + '\n'
				}
			}
			
			return output;
		}
		
	});
	
	sideInitHelper.registerInitDefinition(sitesArchives);

})();
