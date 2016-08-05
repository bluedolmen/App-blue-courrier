var YammaUtils = {
	
	ConfigSite : {
		
		ASSIGNABLE_SITE_CONTAINER_TITLE : 'Services destinataires',
		name : 'bluecourrier',
		
		getConfigSite : function() {
			
			var configSite = siteService.getSite(YammaUtils.ConfigSite.name);
			return configSite;
			
		},
		
		getConfigSiteNode : function() {
			
			var configSite = YammaUtils.ConfigSite.getConfigSite();
			if (null == configSite) return null;
			
			return configSite.node;
			
		},
		
		isConfigSite : function(site) {
			
			var 
				siteNode = Utils.Alfresco.getSiteNode(site),
				siteName = null == siteNode ? null : Utils.asString(site.name)
			;
			
			return (YammaUtils.ConfigSite.name === siteName);		
			
		},
		
		postConfigureSite : function(site) {
			
		},
		
		getOrCreateSiteDataListContainer : function() {
			
			var siteDataListContainer = this.getSiteDataListContainer();
			if (null == siteDataListContainer) {
				siteDataListContainer = this.createSiteDataListContainer();
				
				if (null == siteDataListContainer)
					throw new Error('IllegalStateException! Cannot get or create the site data-list container');
			}				
			
			return siteDataListContainer;
			
		},		
		
		getSiteDataListContainer : function() {
			
			var query = 
				'+TYPE:"dl\:dataList" +' +
				Utils.Alfresco.getLuceneAttributeFilter('dl:dataListItemType', YammaModel.ASSIGNABLE_SITE_TYPE_SHORTNAME);
				
			return Utils.unwrapList(search.luceneSearch(query));
			
		}		
		
	},
	
	removeDataListByType : function(typeShort, siteName) {
		
		var dataList = this.getDataListByType(typeShort, siteName);
		if (null == dataList) return;
		
		dataList.remove();
		
	},
	
	getDataListByType : function(typeShort, siteName) {
		
		if (null == typeShort) {
			throw new Error('IllegalArgumentException! The type is mandatory');
		}
		
		siteName = siteName || YammaUtils.ConfigSite.name;
		
		var site = siteService.getSite(siteName);
		if (null == site) return null;
		
		var dataListsContainer = site.getContainer('dataLists');
		if (null == dataListsContainer) return null;
		
		// Iterate through children (search is index based and may be broken using SOLR)
		return Utils.first(dataListsContainer.children, function match(child) {
			var dlTypeShort = child.properties['dl:dataListItemType'];
			return Utils.asString(typeShort) == Utils.asString(dlTypeShort);
		});
		
	},
	
	/**
	 * 
	 * @param config
	 * {
	 * 		title : '',
	 * 		typeShort : ''
	 * }
	 * @param siteName Defaults to the config site
	 * @returns
	 */
	createDataList : function(config, siteName) {

		if (null == config) {
			throw new Error('IllegalArgumentException! The config object is mandatory');
		}
		
		var
			title = config.title,
			typeShort = config.typeShort,
			name = config.name || null,
			items = config.items || null
		;
		
		if (null == title || null == typeShort) {
			throw new Error('IllegalArgumentException! The config object has to define at least a title and typeShort property');
		}
		
		siteName = siteName || YammaUtils.ConfigSite.name;
		
		var site = siteService.getSite(siteName);
		if (null == site) {
			logger.warn('Site \'' + siteName + '\' does not exist. Cannot create datalist with name \'' + name + '\'');
			return null;
		}
		
		if (!site.hasContainer('dataLists')) {
			site.createContainer('dataLists');
		}
		
		var dataListsContainer = site.getContainer('dataLists');
		if (null == dataListsContainer) {
			throw new Error('IllegalStateException! Cannot get or create the site data-lists container');
		}
		
		var 
			dataListProperties = {
				'cm:title' : title,
				'dl:dataListItemType' : typeShort
			},
			dataListContainer = dataListsContainer.createNode(name, 'dl:dataList', dataListProperties)
		;
		
		if (null != dataListContainer) {
			this.applyPermissions(dataListContainer, config.permissions);
		}
		
		createItems();
		
		function createItems() {
			
			if (null == items) return;
			
			Utils.forEach(items, function(item) {
				
				var name = item['cm:name'] || item['name'] || null;
				dataListContainer.createNode(name, typeShort, item);
				
			});
			
		}
		
		return dataListContainer;
		
		
	},
	
	applyPermissions : function(node, permissions) {
		
		if (null == node) {
			throw new Error('IllegalArgumentException! The provided node is invalid');
		}
		
		if (null == permissions) return;
		
		var
			authorityName = null, 
			permission
		;
		
		for (authorityName in permissions) {
			
			permission = permissions[authorityName];
			if (!permission) continue;
			
			node.setPermission(permission, authorityName); 
			
		} 
		
	}

};
