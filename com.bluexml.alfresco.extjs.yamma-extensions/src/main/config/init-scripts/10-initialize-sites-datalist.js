///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	const ASSIGNABLE_SITE_CONTAINER_TITLE = 'Services destinataires';
	
	main();
	
	function main() {
		if (!checkDataListExists()) return;
		synchronizeDataListItems();
	}
	
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
	
	
	
})();
