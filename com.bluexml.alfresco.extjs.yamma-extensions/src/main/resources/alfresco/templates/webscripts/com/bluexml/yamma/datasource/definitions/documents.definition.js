(function() {	
	
	
	function titleOrName(node) {
		if (null == node) return '';
		
		return node.properties['cm:title'] || node.name || '';		
	};
	
	function titleAndName(node) {
		if (null == node) return '';
		
		var 
			name = node.name,
			title = node.properties['cm:title'] || name
		;
		
		return title + '|' + name;
	}
	
	function authorityDisplayAndName(personNode) {
		if (null == personNode) return '';
		
		var 
			userName = Utils.Alfresco.getPersonUserName(personNode),
			displayName = Utils.Alfresco.getPersonDisplayName(personNode)
		; 
		
		return  displayName + '|' + userName; 
	}
	
	function priorityDisplay(node) {
		if (null == node) return '';
		var 
			priorityLabel = node.name,
			priorityLevel = node.properties[YammaModel.PRIORITY_LEVEL_PROPNAME]
		;
		
		return priorityLabel + '|' + priorityLevel;
	}
	
	function getActionsFieldDefinitions() {
		
		return Utils.map(ActionUtils.getAvailableActionNames(),
			function(actionName) {
				return {
					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '!Action_' + actionName,
					type : 'boolean',
					evaluate : getActionFunction(actionName)
				}; 
			}
		);
		
	}
	
	var servicesCache = Utils.Cache.create(10);
	function getServiceDescription(serviceNode) {
		
		var name = Utils.asString(serviceNode.name);
		
		return servicesCache.getOrSetValue(
			name, 
			function() {
				return ({
					displayName : serviceNode.properties['cm:title'] || name,
					name : name,
					isSigningService : ServicesUtils.isSigningService(serviceNode)		
				});
			} /* computeFun */
		);
		
	}
	
	function getActionFunction(functionName) {
		
		var actualFunction = ActionUtils[functionName];
		return function(node) {
			return actualFunction(node);
		};
		
	}
	
	_fullyAuthenticatedUserName = fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
	_serviceManagersCache = Utils.Object.create(Utils.Cache, { cacheSize : 100});
	_isServiceManagerCache = Utils.Object.create(Utils.Cache, { cacheSize : 100});
		
	DatasourceDefinitions.register('Documents',
		{
			
			baseSearchPath : 'app:company_home/st:sites/cm:{site}/cm:documentLibrary/cm:' + TraysUtils.TRAYS_FOLDER_NAME + '/cm:{tray}//*',
			baseSearchType : YammaModel.DOCUMENT_TYPE_SHORTNAME,
			
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
			
			fields : [
				
				'cm:name',
				'@typeShort',
				'@mimetype',
				'@nodeRef*', // id field (*)
				YammaModel.COMMENTABLE_COMMENT_PROPNAME,
				YammaModel.DIGITIZABLE_DIGITIZED_DATE_PROPNAME,
				YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
				YammaModel.STATUSABLE_STATE_PROPNAME,
				
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
					name : YammaModel.ASSIGNABLE_ASPECT_SHORTNAME + '_service',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME, titleAndName, true);
					}
				},
				
				{
					name : YammaModel.ASSIGNABLE_ASPECT_SHORTNAME + '_authority',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME, authorityDisplayAndName, true);
					}					
				},
				
				{
					name : YammaModel.DISTRIBUTABLE_ASPECT_SHORTNAME + '_services',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.DISTRIBUTABLE_SERVICES_ASSOCNAME, titleAndName);
					}
				},
				
				{
					name : YammaModel.PRIORITIZABLE_ASPECT_SHORTNAME + '_priority',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.PRIORITIZABLE_PRIORITY_ASSOCNAME, priorityDisplay, true);
					}
				},
				
				{
					name : YammaModel.DUEABLE_ASPECT_SHORTNAME + '_delay',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.DUEABLE_DELAY_ASSOCNAME, 'cm:name', true);
					}
				},
				
				YammaModel.DUEABLE_DUE_DATE_PROPNAME,
				
				{
					name : YammaModel.DUEABLE_ASPECT_SHORTNAME + '_lateState',
					type : 'string',
					evaluate : function(node) {
						return DocumentUtils.getLateState(node);
					}
 				},
				
				{
					name : YammaModel.PRIVACY_ASPECT_SHORTNAME + '_level',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.PRIVACY_PRIVACY_LEVEL_ASSOCNAME, 'cm:name', true);
					}
				},
				
				{
					name : 'enclosingService',
					type : 'object',
					evaluate : function(document) {
						var serviceNode = YammaUtils.getSiteNode(document);
						return getServiceDescription(serviceNode);
					}
				},
				
//				{
//					name : 'serviceManagers',
//					type : 'array',
//					evaluate : function(document) {
//						
//						function getServiceManagers(serviceNode) {
//							var
//								serviceManagerNodes = ServicesUtils.getServiceRoleMembers(serviceNode, 'ServiceManager'),
//								displayNames = Utils.map(serviceManagerNodes, function(serviceManagerNode) {
//									if (null == serviceManagerNode) return '';
//									return {
//										displayName : Utils.Alfresco.getPersonDisplayName(serviceManagerNode),
//										userName : serviceManagerNode.properties.userName
//									}
//									//return Utils.Alfresco.getPersonDisplayName(serviceManagerNode) + '|' + serviceManagerNode.properties.userName;
//								})
//							;
//							
//							return displayNames;
//						}
//						
//						var 
//							siteNode = YammaUtils.getSiteNode(document),
//							serviceName = siteNode ? Utils.asString(siteNode.name) : ''
//						;
//						if (!serviceName) return [];
//						
//						var 
//							serviceManagers = _serviceManagersCache.getOrSetValue(
//								serviceName, /* key */
//								getServiceManagers, /* computeFun */
//								[siteNode] /* funArgs */
//							)
//						;
//						
//						return serviceManagers;
//					}
//					
//				},
				
				{
					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '_isCopy',
					type : 'boolean',
					evaluate : function(node) {
						return DocumentUtils.isCopy(node);
					}
				}
				
//				{
//					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '_hasDelegatedSites',
//					type : 'boolean',
//					evaluate : function(document) {
//						var delegatedSites = ServicesUtils.getParentServiceNodes(document);
//						return delegatedSites.length > 0;
//					}
//				}
				
				
			].concat(getActionsFieldDefinitions()),				
				
			
			filters : {
				
				'trayNodeRef' : {
					
					applyQueryFilter : function(query, trayNodeRef) {
						
						if (null == trayNodeRef) {
							throw new Error('IllegalArgumentException! DatasourceDefinition.documents: The tray nodeRef is mandatory');
						}
						
						var trayNode = search.findNode(trayNodeRef);
						if (null == trayNode) return query;
						var trayId = trayNode.name;
						query = query.replace(/\{tray\}/, trayId);
						
						var enclosingSite = YammaUtils.getSiteNode(trayNode);
						if (null == enclosingSite) return query;
						var siteId = enclosingSite.name;
						query = query.replace(/\{site\}/, siteId);
						
						return query;
					}
					
				},
				
				'site' : {
					
					applyQueryFilter : function(query, siteId) {
						
						if (null == siteId) return query;
						query = query.replace(/\{site\}/, siteId);
						
						return query;
					}
					
				},
			
				'tray' : {
					
					applyQueryFilter : function(query, trayId) {
						
						if (null == trayId) return query;
						query = query.replace(/\{tray\}/, trayId);
						
						return query;
					}
					
				},
				
				'assignedAuthority' : {
					
					applyQueryFilter : function(query, authorityId) {
						
						if (null == authorityId) return query;
						
						query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.ASSIGNABLE_AUTHORITY_PROPNAME, authorityId);
						return query;
					}
					
				},
				
				'mine' : {
					
					applyQueryFilter : function(query) {
						
						var authorityId = Utils.Alfresco.getCurrentUserName();
						if (null == authorityId) return query;
						
						query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.ASSIGNABLE_AUTHORITY_PROPNAME, authorityId);
						return query;
					}
					
				},				
				
				'late' : {
					
					applyQueryFilter : function(query, late) {
						
						if (null === late) return query;
						late = (late === true);
						
						query += 
							' +@' + 
							Utils.escapeQName(YammaModel.DUEABLE_DUE_DATE_PROPNAME) +
							':' + (late ? '[MIN TO NOW]' : '[NOW TO MAX]');
						
						return query;
					}
					
				},
				
				'state' : {
					
					applyQueryFilter : function(query, stateId) {
						
						if (null == stateId) return query;
						
						query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.STATUSABLE_STATE_PROPNAME, stateId);
						return query;
						
					}
					
				},
				
				'archived' : {
					
					applyQueryFilter : function(query, value) {
						
						if ('true' !== value) return query;
						
						query = query.replace(/cm:documentLibrary\/.*\/\/\*/,'cm:documentLibrary/cm:' + ArchivesUtils.ARCHIVES_FOLDER_NAME + '//*');
						query += ' +' + Utils.Alfresco.getLuceneAttributeFilter(YammaModel.STATUSABLE_STATE_PROPNAME, YammaModel.DOCUMENT_STATE_ARCHIVED);
						
						return query;
						
					}
					
				},
				
				'can' : {
					
					acceptNode : function(node, value) {
						
						if (!value) return;
						
						var 
							actionNames = [],
							accept = false
						;
						
						if ('*' == value) {
							actionNames = ActionUtils.getAvailableActionNames();
						} else if (-1 != value.indexOf(',')) { 
							actionNames = Utils.map(value.split(','), function(val) { return Utils.String.trim(val); });
						} else {
							actionNames = [value]
						}
						
						Utils.forEach(actionNames, function(actionName) {
							actionName = Utils.String.startsWith(actionName,'can') ? actionName : ('can' + Utils.String.capitalize(actionName));
							
							var action = ActionUtils[actionName];
							if (!action) return; // continue
							
							accept = action(node);
							if (accept) return false; // break if know that the node is accepted
						});
						
						return accept;
					}
					
				},
				
				'nodeRef' : CommonDatasourceFilters['nodeRef'],
				'term' : CommonDatasourceFilters['term']
				
			}
			
	
		}
		
	);
	

})();