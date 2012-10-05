(function() {	
	
	
	function titleOrName(node) {
		if (!node) return '';
		
		var title = node.properties['cm:title'];
		if (title) return title;
		
		return node.name || '';
	};
	
	function titleAndName(node) {
		if (!node) return '';
		
		var name = node.name;
		var title = node.properties['cm:title'] || name;
		
		return title + '|' + name;
	}
	
	function authorityDisplayAndName(node) {
		if (!node) return '';
		
		var userName = Utils.getPersonUserName(node);
		var displayName = Utils.getPersonDisplayName(node); 
		
		return  displayName + '|' + userName; 
	}
	
	function priorityDisplay(node) {
		if (!node) return '';
		var priorityLabel = node.name;
		var priorityLevel = node.properties[YammaModel.PRIORITY_LEVEL_PROPNAME];
		
		return priorityLabel + '|' + priorityLevel;
	}
	
	function getActionsFieldDefinitions() {
		var definitions = [];
		
		for (var methodName in ActionUtils) {
			if (!(methodName.indexOf('can') == 0)) continue;
			
			definitions.push({
				name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '!Action_' + methodName,
				type : 'boolean',
				evaluate : getActionFunction(methodName)
			});
		}
		
		return definitions;
		
		function getActionFunction(functionName) {
			var actualFunction = ActionUtils[functionName];
			
			return function(node) {
				return actualFunction(node);
			};
		}
	}
	
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
				'@nodeRef*',
				YammaModel.COMMENTABLE_COMMENT_PROPNAME,
				YammaModel.DIGITIZABLE_DIGITIZED_DATE_PROPNAME,
				YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
				YammaModel.STATUSABLE_STATE_PROPNAME,
				
				{
					name : 'cm:generalclassifiable_categories',
					type : 'string',
					evaluate : function(node) {
						var categories = node.properties['cm:categories'];
						return Utils.asString(categories);
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
					name : 'enclosingSite',
					type : 'string',
					evaluate : function(document) {
						var siteNode = YammaUtils.getSiteNode(document);
						if (!siteNode) return '';
						
						if (siteNode.properties.title) return siteNode.properties.title;
						return siteNode.name;
					}
				},
				
				{
					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '_isCopy',
					type : 'boolean',
					evaluate : function(node) {
						return DocumentUtils.isCopy(node);
					}
				},
				
				{
					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + 'hasDelegatedSites',
					type : 'boolean',
					evaluate : function(document) {
						var delegatedSites = ServicesUtils.getDelegatedServices(document);
						return delegatedSites.length > 0;
					}
				},
				
				{
					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '_hasReplies',
					type : 'boolean',
					evaluate : function(node) {
						return ReplyUtils.hasReplies(node);
					}
				}				
				
				
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
						if (!enclosingSite) return query;
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
						
						query += ' +' + Utils.getLuceneAttributeFilter(YammaModel.ASSIGNABLE_AUTHORITY_PROPNAME, authorityId);
						return query;
					}
					
				},
				
				'mine' : {
					
					applyQueryFilter : function(query) {
						
						var authorityId = person.properties.userName;
						if (null == authorityId) return query;
						
						query += ' +' + Utils.getLuceneAttributeFilter(YammaModel.ASSIGNABLE_AUTHORITY_PROPNAME, authorityId);
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
						
						query += ' +' + Utils.getLuceneAttributeFilter(YammaModel.STATUSABLE_STATE_PROPNAME, stateId);
						return query;
						
					}
					
				},
				
				'archived' : {
					
					applyQueryFilter : function(query, value) {
						
						if ('true' !== value) return query;
						
						query = query.replace(/cm:documentLibrary\/.*\/\/\*/,'cm:documentLibrary/cm:' + ArchivesUtils.ARCHIVES_FOLDER_NAME + '//*');
						query += ' +' + Utils.getLuceneAttributeFilter(YammaModel.STATUSABLE_STATE_PROPNAME, YammaModel.DOCUMENT_STATE_ARCHIVED);
						
						return query;
						
					}
					
				},
				
				'nodeRef' : CommonDatasourceFilters['nodeRef'],
				'term' : CommonDatasourceFilters['term']
				
			}
			
	
		}
		
	);
	

})();