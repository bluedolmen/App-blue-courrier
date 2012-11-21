function creatSiteTrays() {
	
	var sites = siteService.listSites(null, null);		
	if (!sites) return;
	
	Utils.forEach(sites, function(site) {
		
		var siteNode = site.getNode(),
			siteName = siteNode.name
		;
		
		if (YammaUtils.isConfigSite(siteNode)) return; // do not create trays in the admin site			
		logger.log("Checking site '" + siteName + "' for trays structure...");
		
		TraysUtils.createSiteTrays(siteNode);
		
	});	
	
	
}

Init.Utils.register(creatSiteTrays, 20);

(function() {

	var sitesTrays = Utils.Object.create(Init.InitDefinition, {
		
		id : 'sites-trays',
		level : 20,		
		
		initSite : function(siteName) {
			
			if (YammaUtils.isConfigSite(siteName)) return; // do not create trays in the admin site			
			logger.log("Checking site '" + siteName + "' for trays structure...");
			
			var siteNode = Utils.Alfresco.getSiteNode(siteName);
			TraysUtils.createSiteTrays(siteNode);
			
		},
		
		clearSite : function(siteName) {
			
			var siteTraysNode = TraysUtils.getSiteTraysNode(siteName);
			if (null == siteTraysNode) return; // skip site
			
			siteTraysNode.remove();
			
		},
		
		checkInstalled : function() {
			var
				sitesMap = Utils.arrayToMap(siteService.listSites(null, null), function(site) { return site.shortName; })
			;		

			for (var siteName in sitesMap) {
				if (YammaUtils.isConfigSite(siteName)) continue;
				
				var traysDetails = this.getTraysDetails(sitesMap[siteName]);				
				if (!Utils.isArrayEmpty(traysDetails.missingTrays)) {
					return Init.InstallationStates.PARTIALLY;
				}
			}
			
			for (var siteName in sitesMap) {
				if (YammaUtils.isConfigSite(siteName)) continue;
				
				var traysDetails = this.getTraysDetails(sitesMap[siteName]);				
				if (!Utils.isArrayEmpty(traysDetails.unknownTrays)) {
					return Init.InstallationStates.MODIFIED;
				}
			}
			
			return Init.InstallationStates.FULL;
		},
		
		getDetails : function() {
			var
				output = '',
				localOutput = '',
				sitesMap = Utils.arrayToMap(siteService.listSites(null, null), function(site) { return site.shortName; })
			;		

			for (var siteName in sitesMap) {
				if (YammaUtils.isConfigSite(siteName)) continue;
				
				localOutput = '';
				
				var traysDetails = this.getTraysDetails(sitesMap[siteName]);
				Utils.forEach(traysDetails.missingTrays, function(missingTrayName) {
					localOutput += missingTrayName + ' missing; '
				});
				
				Utils.forEach(traysDetails.unknownTrays, function(missingTrayName) {
					localOutput += missingTrayName + ' unknown; '
				});
				
				if (localOutput) {
					output += siteName + ' -> ' + localOutput + '\n';
				} else {
					output += '[OK] ' + siteName + '\n';
				}
			}
			
			return output;
		},
		
		getTraysDetails : function(site) {
			var 
				siteTrays = Utils.arrayToMap(TraysUtils.getSiteTraysChildren(site), function(tray) {return tray.name;})
				missingTrays = [],
				unknownTrays = []
			;
			
			Utils.forEach([
					TraysUtils.INBOX_TRAY_NAME,
					TraysUtils.OUTBOX_TRAY_NAME,
					TraysUtils.CCBOX_TRAY_NAME
				], function(trayName) {
					if (undefined === siteTrays[trayName]) {
						missingTrays.push(trayName);
					} else {
						delete siteTrays[trayName];
					}
				}
			)
			
			for (var trayName in siteTrays) {
				unknownTrays.push(trayName);
			}
			
			return {
				missingTrays : missingTrays,
				unknownTrays : unknownTrays
			}
		}
		
	});
	
	sideInitHelper.registerInitDefinition(sitesTrays);

})();
