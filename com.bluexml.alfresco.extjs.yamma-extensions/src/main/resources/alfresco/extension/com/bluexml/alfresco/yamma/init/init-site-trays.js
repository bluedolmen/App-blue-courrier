(function() {

	var sitesTrays = Utils.Object.create(Init.InitDefinition.BySite.Yamma, {
		
		id : 'sites-trays',
		level : 20,		
		
		initSite : function(site, siteName) {
			
			logger.log("Checking site '" + siteName + "' for trays structure...");
			
			var siteNode = Utils.Alfresco.getSiteNode(siteName);
			TraysUtils.createSiteTrays(siteNode);
			
		},
		
		clearSite : function(site, siteName) {
			
			var
				siteTraysNode = TraysUtils.getSiteTraysNode(siteName)
			;
			if (null == siteTraysNode) return; // skip site
			
			siteTraysNode.remove();
			
		},
		
		checkSiteInstalled : function(site) {
			
			var 
				siteName = this.getSiteName(site),
				traysDetails = this.getTraysDetails(site),
				allMissing = traysDetails.allMissing,
				missingEmpty = Utils.isArrayEmpty(traysDetails.missingTrays),
				unknownEmpty = Utils.isArrayEmpty(traysDetails.unknownTrays) 
			;
			
			if (allMissing) return Init.InstallationStates.NO
			else if (!missingEmpty) return Init.InstallationStates.PARTIALLY;
			else if (!unknownEmpty) return Init.InstallationStates.MODIFIED;
			else return Init.InstallationStates.FULL;
			
		},
		
		getSiteDetails : function(site) {
			
			localOutput = '';
			
			var traysDetails = this.getTraysDetails(site);
			Utils.forEach(traysDetails.missingTrays, function(missingTrayName) {
				localOutput += missingTrayName + ' missing; '
			});
			
			Utils.forEach(traysDetails.unknownTrays, function(missingTrayName) {
				localOutput += missingTrayName + ' unknown; '
			});
			
			if (localOutput) return localOutput;
			else return 'OK';
			
		},
		
		getTraysDetails : function(site) {
			
			var 
				siteTrays = Utils.arrayToMap(TraysUtils.getSiteTraysChildren(site), function(tray) {return tray.name;})
				missingTrays = [],
				unknownTrays = [],
				testedTrays = [
					TraysUtils.INBOX_TRAY_NAME,
					TraysUtils.OUTBOX_TRAY_NAME,
					TraysUtils.CCBOX_TRAY_NAME
				] 
			;
			
			Utils.forEach(testedTrays, function(trayName) {
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
				allMissing : testedTrays.length == missingTrays.length,
				missingTrays : missingTrays,
				unknownTrays : unknownTrays
			}
			
		}
		
	});
	
	sideInitHelper.registerInitDefinition(sitesTrays);

})();
