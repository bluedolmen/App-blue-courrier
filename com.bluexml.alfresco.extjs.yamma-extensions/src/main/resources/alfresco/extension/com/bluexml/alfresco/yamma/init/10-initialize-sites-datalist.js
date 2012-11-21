function initializeSitesDatalist() {
	
	const ASSIGNABLE_SITE_CONTAINER_TITLE = 'Services destinataires';
	
	if (!checkDataListExists()) return;
	synchronizeDataListItems();
	
	function checkDataListExists() {
		
		if ('undefined' != typeof sideDictionary) {
			var type = sideDictionary.getType(YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME);
			return type;
		}
		
		logger.warn('Cannot find sideDictionary object. Cannot check the datalist-type exists. Aborting initialization of the site-datalist.');
		return false;
	}
	
	function synchronizeDataListItems() {
		
		var siteDataListContainer = getOrCreateSiteDataListContainer();
		if (!siteDataListContainer) {
			logger.warn('Cannot get nor create the data-list container for sites.');
			return;
		}
		
		var siteList = getSiteList();
		// A map on site-names
		var siteMap = Utils.ArrayToMap(siteList,
			function(site) {
				return site.shortName;
			}
		);
		
		var dataListItems = getDataListItems(siteDataListContainer);
		var definedItemNames = Utils.ArrayToMap(dataListItems,
			function(dataListItem) {
				return dataListItem.name;
			}
		);
		
		for (var siteName in siteMap) {
			if (YammaUtils.isConfigSite(siteName)) continue;
			
			var site = definedItemNames[siteName]; 
			if (site) continue;
			// create site-name data-list item
			logger.info("Site '" + siteName + "' does not exist in Site data-list. Creating it.");
			
	      	var actualSite = siteService.getSite(siteName);
			var properties = {
				'cm:title' : actualSite ? actualSite.title : siteName
			};
			
			siteDataListContainer.createNode(siteName, YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME, properties);			
		}
		
	}
	
	function getOrCreateSiteDataListContainer() {
		var siteDataListContainer = getSiteDataListContainer();
		if (siteDataListContainer) return siteDataListContainer;
		
		return createSiteDataListContainer();
	}
	
	function createSiteDataListContainer() {
		
		var configSite = YammaUtils.getOrCreateConfigSite();
		if (!configSite) return null;
		
		var dataListsContainer = configSite.childByNamePath('dataLists');
		if (!dataListsContainer) return null;
		
		var dataListProperties = {
			'cm:title' : ASSIGNABLE_SITE_CONTAINER_TITLE,
			'dl:dataListItemType' : YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME
		};
		var dataListContainer = dataListsContainer.createNode(null, 'dl:dataList', dataListProperties);
		
		return dataListContainer;
	}
	
	function getSiteDataListContainer() {
		
		var query = 
			'+TYPE:"dl\:dataList" +' +
			Utils.Alfresco.getLuceneAttributeFilter('dl:dataListItemType',YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME);
			
		return Utils.unwrapList(search.luceneSearch(query));
		
	}
	
	function getSiteList() {		
		return siteService.listSites('','');
	}
	
	function getDataListItems(dataListContainer) {
		return dataListContainer.children || [];
	}
	
	
}

Init.Utils.register(initializeSitesDatalist, 10);

(function() {

	var SitesDataList = Utils.Object.create(Init.InitDefinition.BySite, {
		
		ASSIGNABLE_SITE_CONTAINER_TITLE : 'Services destinataires',
		
		id : 'sites-datalist',
		level : 10,
		
		init : function() {
			
			this.getOrCreateSiteDataListContainer();
			Init.InitDefinition.BySite.init.call(this);
			
		},
		
		initSite : function(siteName) {
			
			if (YammaUtils.isConfigSite(siteName)) return;
			
			var 
				siteDataListContainer = this.getOrCreateSiteDataListContainer(),
				site = dataListItems[siteName], 
				actualSite, properties
			;
			 
			if (null == site) return;
			// create site-name data-list item
			logger.info("Site '" + siteName + "' does not exist in Site data-list. Creating it.");
			
	      	actualSite = siteService.getSite(siteName);
			properties = {
				'cm:title' : actualSite ? actualSite.title : siteName
			};
			
			siteDataListContainer.createNode(siteName, YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME, properties);
		},
		
		clear : function() {
			
			var 
				siteDataListContainer = this.getSiteDataListContainer()
			;
			
			if (siteDataListContainer) {
				siteDataListContainer.remove();
			}
		},
		
		checkInstalled : function() {
			var siteDataListContainer = this.getSiteDataListContainer();
			if (!siteDataListContainer) {
				return Init.InstallationStates.NO;
			}
			
			var 
				dataListItems = Utils.arrayToMap(this.getDataListItems(), this.getNameFun),
				siteMap = Utils.arrayToMap(this.getSiteList(), this.getSiteName),
				installationState = null
			;

			for (var siteName in siteMap) {
				if (YammaUtils.isConfigSite(siteName)) return;
				
				if (undefined === dataListItems[siteName]) {
					return Init.InstallationStates.PARTIALLY;
				}
			};
			
			for (var dataListItem in dataListItems) {
				if (undefined === siteMap[dataListItem]) {
					return Init.InstallationStates.MODIFIED;
				}
			}
			
			return Init.InstallationStates.FULL;
		},
		
		getDetails : function() {
			
			var 
				siteDataListContainer = this.getSiteDataListContainer(),
				output = ''
			;
			if (!siteDataListContainer) {
				return output;
			}
			
			var 
				dataListItems = Utils.arrayToMap(this.getDataListItems(), this.getNameFun),
				siteMap = Utils.arrayToMap(this.getSiteList(), this.getSiteName),
				installationState = null
			;

			for (var siteName in siteMap) {
				if (YammaUtils.isConfigSite(siteName)) continue;
				
				if (undefined === dataListItems[siteName]) {
					output += '[MISSING] ' + siteName + '\n';
				} else {
					output += '[OK] '  + siteName + '\n';
				}
				delete dataListItems[siteName];
			}
			
			for (var dataListItem in dataListItems) {
				if (undefined === siteMap[dataListItem]) {
					output += '[UNMAPPED] ' + dataListItem + '\n';
				}
			}
			
			return output;
			
		},
		
		getOrCreateSiteDataListContainer : function() {
			
			if (undefined === this.siteDataListContainer) {
				this.siteDataListContainer = this.getSiteDataListContainer();
				if (null == this.siteDataListContainer) {
					this.siteDataListContainer = this.createSiteDataListContainer();
					
					if (null == this.siteDataListContainer)
						throw new IllegalStateException('Cannot get or create the site data-list container');
				}				
			}
			
			return this.siteDataListContainer;
			
		},		
		
		createSiteDataListContainer : function() {
			
			var configSite = YammaUtils.getOrCreateConfigSite();
			if (!configSite) return null;
			
			var dataListsContainer = configSite.childByNamePath('dataLists');
			if (!dataListsContainer) return null;
			
			var dataListProperties = {
				'cm:title' : ASSIGNABLE_SITE_CONTAINER_TITLE,
				'dl:dataListItemType' : YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME
			};
			var dataListContainer = dataListsContainer.createNode(null, 'dl:dataList', dataListProperties);
			
			return dataListContainer;
		},
		
		getSiteDataListContainer : function() {
			
			var query = 
				'+TYPE:"dl\:dataList" +' +
				Utils.Alfresco.getLuceneAttributeFilter('dl:dataListItemType',YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME);
				
			return Utils.unwrapList(search.luceneSearch(query));
			
		},		
		
		getDataListItems : function(dataListContainer) {
			dataListContainer = dataListContainer || this.getSiteDataListContainer();
			if (!dataListContainer) return [];
			
			return dataListContainer.children || [];
		},
		
		getNameFun : function(object) { return object.name; }
		
		
	});
	
	sideInitHelper.registerInitDefinition(SitesDataList);

})();
