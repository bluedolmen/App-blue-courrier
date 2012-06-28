///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-utils.js">

(function() {
	
	const ASSIGNABLE_SITE_CONTAINER_TITLE = 'Services destinataires';
	
	main();
	
	function main() {
		if (!checkDataListExists()) return;
		synchronizeDataListItems();
	}
	
	function checkDataListExists() {
		
		if ('undefined' != typeof sideDictionary) {
			var type = sideDictionary.getType(ASSIGNABLE_SITE_TYPE_SHORTNAME);
			return type;
		}
		
		return false;
	}
	
	function synchronizeDataListItems() {
		logger.log('Synchronizing site datalist');
		
		var siteDataListContainer = getOrCreateSiteDataListContainer();
		if (!siteDataListContainer) {
			logger.warn('Cannot get nor create the data-list container for sites.');
			return;
		}
		
		var siteList = getSiteList();
		// A map on site-names
		var siteMap = Utils.ArrayToMap(siteList,
			function(site) {
				return site.name;
			}
		);
		
		var dataListItems = getDataListItems(siteDataListContainer);
		var definedItemNames = Utils.ArrayToMap(dataListItems,
			function(dataListItem) {
				return dataListItem.name;
			}
		);
		
		for (siteName in siteMap) {
			var site = definedItemNames[siteName]; 
			if (site) continue;
			// create site-name data-list item
			logger.log("Site '" + siteName + "' does not exist in Site data-list. Creating it.");
			
          	var actualSite = siteService.getSite(siteName);
			var properties = {
				'cm:title' : actualSite ? actualSite.title : siteName
			};
			
			siteDataListContainer.createNode(siteName, ASSIGNABLE_SITE_TYPE_SHORTNAME, properties);			
		}
		
	}
	
	function getOrCreateSiteDataListContainer() {
		var siteDataListContainer = getSiteDataListContainer();
		if (siteDataListContainer) return siteDataListContainer;
		
		return createSiteDataListContainer();
	}
	
	function createSiteDataListContainer() {
		
		var adminSite = YammaUtils.getAdminSite();
		if (!adminSite) return null;
		
		var dataListsContainer = adminSite.childByNamePath('dataLists');
		if (!dataListsContainer) return null;
		
		//var dataListName = localName(ASSIGNABLE_SITE_TYPE_SHORTNAME);
		var dataListProperties = {
			'cm:title' : ASSIGNABLE_SITE_CONTAINER_TITLE,
			'dl:dataListItemType' : ASSIGNABLE_SITE_TYPE_SHORTNAME
		};
		var dataListContainer = dataListsContainer.createNode(null, 'dl:dataList', dataListProperties);
		
		return dataListContainer;
	}
	
	function getSiteDataListContainer() {
		
		var query = 
			'+TYPE:"dl\:dataList" +' +
			Utils.getLuceneAttributeFilter('dl:dataListItemType',ASSIGNABLE_SITE_TYPE_SHORTNAME);
			
		return Utils.unwrapList(search.luceneSearch(query));
		
	}
	
	function getSiteList() {
		
		var query = '+TYPE:"st\:site"';
		return search.luceneSearch(query);
		
	}
	
	function getDataListItems(dataListContainer) {
		return dataListContainer.childAssocs['cm:contains'] || [];
	}
	
	
	
})();
