///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-utils.js">

(function() {

	main();
	
	function main() {
		
		checkAndCreateExistingSitesStucture();
	
	}
	
	function checkAndCreateExistingSitesStucture() {
		
		var sites = companyhome.childByNamePath('Sites');
		if (!sites) return;
		
		Utils.forEach(sites.children, function(site) {
			
			if (YammaUtils.isAdminSite(site)) return; // do not create trays in the admin site
			
			var siteName = site.name;
			logger.log("Checking site '" + siteName + "' for trays structure...");
			
//			var trays = TraysUtils.getSiteTraysNode(site);
//			if (trays) return;
//			
//			logger.log('Missing trays. Creating them.');
			TraysUtils.createSiteTrays(site);
			
		});	
		
	}
	
})();

