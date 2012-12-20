(function() {

	var sitesArchives = Utils.Object.create(Init.InitDefinition.BySite.Yamma, {
		
		id : 'sites-archives',
		level : 20,
		
		initSite : function(site, siteName) {
			
			logger.log("Checking site '" + siteName + "' for archives structure...");
			
			var siteNode = Utils.Alfresco.getSiteNode(site);
			if (!siteNode) {
				logger.error("The site '" + siteName + "' does not match any existing site. Ignoring...");
				return;
			}
			
			var archivesContainer = ArchivesUtils.getArchivesContainer(siteNode);
			if (null != archivesContainer) return; // already created
			
			ArchivesUtils.createArchivesFolder(siteNode);
		},
		
		clearSite : function(site) {
			var
				siteNode = Utils.Alfresco.getSiteNode(site),
				archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
			;
			
			if (null == archivesContainer) return; // skip site
			archivesContainer.remove();
		},
		
		checkSiteInstalled : function(site) {
			var
				siteNode = site.getNode(),
				archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
			;
			
			if (null == archivesContainer) return Init.InstallationStates.NO;
			else return Init.InstallationStates.FULL;
		},
		
		getSiteDetails : function(site) {
			var
				siteNode = site.getNode(),
				archivesContainer = ArchivesUtils.getArchivesContainer(siteNode)
			;
			
			if (null == archivesContainer) return 'MISSING';
			else return 'OK';
		}		
		
	});
	
	sideInitHelper.registerInitDefinition(sitesArchives);

})();
