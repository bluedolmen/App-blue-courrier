(function() {

	var SitesDataList = Utils.Object.create(Init.InitDefinition.BySite, {
		
		ASSIGNABLE_SITE_CONTAINER_TITLE : 'Services destinataires',
		
		id : 'sites-datalist',
		level : 10,
		
		init : function() {
			
			this.getOrCreateSiteDataListContainer();
			Init.InitDefinition.BySite.init.call(this);
			
		},
		
		initSite : function(site, siteName) {
			
			var 
				siteDataListContainer = this.getOrCreateSiteDataListContainer(),
				dataListItems = Utils.arrayToMap(this.getDataListItems(), this.getNameFun),
				siteDLItem = dataListItems[siteName], 
				actualSite, properties
			;
			
			if (null != siteDLItem) return;
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
			
			if (!siteDataListContainer) return;
			siteDataListContainer.remove();
		},
		
		clearSite : Utils.emptyFn,
		
		checkInstalled : function() {
			var siteDataListContainer = this.getSiteDataListContainer();
			if (!siteDataListContainer) return Init.InstallationStates.NO;
			
			this.dataListItems = Utils.arrayToMap(this.getDataListItems(), this.getNameFun);
			
			var status = Init.InitDefinition.BySite.checkInstalled.call(this);
			
			if (
				Init.InstallationStates.PARTIALLY == status ||
				Init.InstallationStates.NO == status // the container is installed => partial installation
			) return Init.InstallationStates.PARTIALLY;
			
			for (var item in this.dataListItems) return Init.InstallationStates.MODIFIED; 
			return status;
		},
		
		checkSiteInstalled : function(site) {
			
			var 
				siteName = this.getSiteName(site),
				missing = undefined === this.dataListItems[siteName]				
			;
			
			delete this.dataListItems[siteName];
			
			if (missing) return Init.InstallationStates.NO;
			else return Init.InstallationStates.FULL;
			
		},
		
		getDetails : function() {
			
			var siteDataListContainer = this.getSiteDataListContainer();
			if (!siteDataListContainer) return 'Missing data-list container.';
			
			this.dataListItems = Utils.arrayToMap(this.getDataListItems(), this.getNameFun);
			
			var output = Init.InitDefinition.BySite.getDetails.call(this);
			
			for (var dataListItem in this.dataListItems) {
				output += Utils.asString(dataListItem) + ' : [UNMAPPED]' +  + '\n';
			}
			
			return output;
		},
		
		getSiteDetails : function(site) {
		
			var 
				siteName = this.getSiteName(site),
				missing = undefined === this.dataListItems[siteName] 
			;

			delete this.dataListItems[siteName];

			if (missing) return 'MISSING';
			else return 'OK';
		},
		
		
		getOrCreateSiteDataListContainer : function() {
			
			var siteDataListContainer = this.getSiteDataListContainer();
			if (null == siteDataListContainer) {
				siteDataListContainer = this.createSiteDataListContainer();
				
				if (null == siteDataListContainer)
					throw new IllegalStateException('Cannot get or create the site data-list container');
			}				
			
			return siteDataListContainer;
			
		},		
		
		createSiteDataListContainer : function() {
			
			var configSite = YammaUtils.getOrCreateConfigSite();
			if (!configSite) return null;
			
			var dataListsContainer = configSite.childByNamePath('dataLists');
			if (!dataListsContainer) return null;
			
			var dataListProperties = {
				'cm:title' : this.ASSIGNABLE_SITE_CONTAINER_TITLE,
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
		
		getNameFun : function(object) { return object.name; },
		
		getSiteList : function() {		
			return Utils.filter(siteService.listSites('',''),
				function accept(site) {
					return !YammaUtils.isConfigSite(site.shortName);
				}
			);
		}		
		
		
	});
	
	sideInitHelper.registerInitDefinition(SitesDataList);

})();
