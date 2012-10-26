function creatSiteTrays() {
	
	var sites = siteService.listSites(null, null);		
	if (!sites) return;
	
	Utils.forEach(sites, function(site) {
		
		var siteNode = 
			site.getNode(),
			siteName = siteNode.name
		;
		
		if (YammaUtils.isConfigSite(siteNode)) return; // do not create trays in the admin site			
		logger.log("Checking site '" + siteName + "' for trays structure...");
		
		TraysUtils.createSiteTrays(siteNode);
		
	});	
	
	
}

InitUtils && InitUtils.register(creatSiteTrays, 20);

