(function() {	

	var servicesCache = Utils.Cache.create(30);
	function getServiceDescription(serviceNode) {
		
		var name = Utils.asString(serviceNode.name);
		
		return servicesCache.getOrSetValue(
			name, 
			function() {
				return ({
					displayName : serviceNode.properties['cm:title'] || name,
					name : name
				});
			} /* computeFun */
		);
		
	}
	
	function priorityDisplay(node) {
		if (null == node) return '';
		var 
			priorityLabel = node.name,
			priorityLevel = node.properties[YammaModel.PRIORITY_LEVEL_PROPNAME]
		;
		
		return priorityLabel + '|' + priorityLevel;
	}
		
	CommonDatasourceFilters.documents = {
			
		'trayNodeRef' : {
			
			applyQueryFilter : function(query, trayNodeRef) {
				
				if (null == trayNodeRef) {
					throw new Error('IllegalArgumentException! DatasourceDefinition.documents: The tray nodeRef is mandatory');
				}
				
				var trayNode = search.findNode(trayNodeRef);
				if (null == trayNode) return query;
				var trayId = trayNode.name;
				query = query.replace(/\{tray\}/, trayId);
				
				var enclosingSite = Utils.Alfresco.getEnclosingSiteNode(trayNode);
				if (null == enclosingSite) return query;
				var siteId = enclosingSite.name;
				query = query.replace(/\{site\}/, siteId);
				
				return query;
			}
			
		},
		
		'site' : {
			
			applyQueryFilter : function(query, siteId) {
				
				if (null == siteId) return query;
				
				var sites = Utils.String.splitToTrimmedStringArray(siteId);
				if (sites.length > 1) {
					// manage several sites
					
					query = query.replace(/\+PATH\s*:\s*"([^"]*)"/,function(p0,p1) {
						
						return ( 
							'+PATH:(' +
								
							Utils.String.join(
								Utils.map(sites, function(siteName) {
									return '"' + p1.replace(/\{site\}/, siteName) + '"';
								}),
								' '
							) +
							
							')'
						);
						
					});
					
				}
				else {
					
					if ('root' == siteId || 'all' == siteId) {
						siteId = '*';
					}
					
					query = query.replace(/\{site\}/, siteId);
					
				}
				
				return query;
			}
			
		},

		'modifiedXDaysAgo' : {
			
			applyQueryFilter : CommonDatasourceFilters.datePropertyRangeFilter('cm:modified') 
			
		},
		
		'state' : {
			
			applyQueryFilter : function(query, stateId) {
				
				if (null == stateId) return query;
				
				query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.STATUSABLE_STATUS_PROPNAME, stateId);
				return query;
				
			}
			
		},
		
		'archived' : {
			
			applyQueryFilter : function(query, value) {
				
				if ('true' !== value) return query;
				
				query = query.replace(/cm:documentLibrary\/.*\/\/\*/,'cm:documentLibrary/cm:' + ArchivesUtils.ARCHIVES_FOLDER_NAME + '//*');
				query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.STATUSABLE_STATUS_PROPNAME, YammaModel.DOCUMENT_STATE_ARCHIVED);
				
				return query;
				
			}
			
		},
		
		'nodeRef' : CommonDatasourceFilters['nodeRef'],
		'term' : CommonDatasourceFilters['term']				
		
	};
	
	
	DatasourceDefinitions.register('Documents',
		{
			
			baseSearchPath : 'app:company_home/st:sites/cm:{site}/cm:documentLibrary//*',
		
			baseSearchType : YammaModel.DOCUMENT_ASPECT_SHORTNAME,
			
			searchAdditional : {
				
				postProcessQuery : function(query) {
					
					if (!query) return query;
					if (query.indexOf('{site}') > -1) {
						query = query.replace(/cm:\{site\}/, '*');
					}
					
					if (query.indexOf('{tray}') > -1) {
						query = query.replace(/cm:\{tray\}/, '*');
					}
					
					query = query + ' -ASPECT:"sys:temporary"';
					
					return query;
					
				},
				
				sortBy : {
					column : 'cm:name',
					dir : 'ASC'
				}
				
			},
			
			mixins : ['MyTasks','Signed'],
			
			fields : [
				
				'cm:name',
				'@typeShort',
				'@mimetype',
				'@nodeRef*', // id field (*)
				YammaModel.DIGITIZABLE_DIGITIZED_DATE_PROPNAME,
				YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
				YammaModel.STATUSABLE_STATUS_PROPNAME,
				
				{
					name : 'cm:generalclassifiable_categories',
					type : 'string',
					evaluate : function(node) {
						var categories = node.properties['cm:categories'] || [];
						return Utils.reduce(categories, 
							function(category, aggregate, isLast) {
								return aggregate + category.name + (isLast ? '' : ',');
							},
							''
						);
					}
				},
				
				{
					name : YammaModel.PRIORITIZABLE_PRIORITY_PROPNAME,
					type : 'string'
				},
				
				{
					name : YammaModel.DUEABLE_DELAY_PROPNAME,
					type : 'string'
				},
				
				YammaModel.DUEABLE_DUE_DATE_PROPNAME,
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':' + 'lateState',
					type : 'string',
					evaluate : function(node) {
						return DocumentUtils.getLateState(node);
					}
 				},
				
 				YammaModel.PRIVACY_PRIVACY_LEVEL_PROPNAME,
				
				{
					name : 'enclosingService',
					type : 'string',
					evaluate : function(document) {
						return Utils.Alfresco.getEnclosingSiteName(document);
					}
				},
				
				{
					name : YammaModel.DOCUMENT_ASPECT_SHORTNAME + 'IsCopy',
					type : 'boolean',
					evaluate : function(node) {
						return DocumentUtils.isCopy(node);
					}
				},
				
				{
					name : YammaModel.DOCUMENT_ASPECT_SHORTNAME + 'Kind',
					type : 'string',
					evaluate : function(node) {
						return 'document';
					}
				},
				
				{
					name : 'permissions',
					type : 'object',
					evaluate : function(node) {
						
						var result = {							
							Delete: node.hasPermission('Delete'),
							Write: node.hasPermission('Write'),
							AddChildren : node.hasPermission('AddChildren')
						};
						
						return result;
						
					}
				}
				
				
			],
				
			filters : CommonDatasourceFilters.documents
	
		}
		
	);
	

})();