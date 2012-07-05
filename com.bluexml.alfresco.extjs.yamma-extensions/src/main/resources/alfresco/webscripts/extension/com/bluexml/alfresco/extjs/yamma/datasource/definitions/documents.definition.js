(function() {	
	
	
	function titleOrName(node) {
		if (!node) return '';
		if (!node.properties) return '';
		
		var title = node.properties['cm:title'];
		if (title) return title;
		
		return node.name || '';
	};
	
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
				'@nodeRef',
				YammaModel.COMMENTABLE_COMMENT_PROPNAME,
				YammaModel.DIGITIZABLE_DIGITIZED_DATE_PROPNAME,
				YammaModel.REFERENCEABLE_REFERENCE_PROPNAME,
				YammaModel.STATUSABLE_STATE_PROPNAME,				
				
				{
					name : YammaModel.DOCUMENT_TYPE_SHORTNAME + '_isCopy',
					type : 'boolean',
					evaluate : function(node) {
						var originalAssocs = node.assocs[YammaModel.DOCUMENT_COPY_ORIGINAL_ASSOCNAME];
						return (null != originalAssocs) && (originalAssocs.length > 0);
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':Assignable_service',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME, titleOrName, true)
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':Assignable_service_isDelivered',
					type : 'boolean',
					evaluate : function(node) {
						return YammaUtils.isMailDelivered(node);
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':Distributable_services',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.DISTRIBUTABLE_SERVICES_ASSOCNAME, titleOrName);
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':Prioritizable_delay',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.PRIORITIZABLE_DELAY_ASSOCNAME, 'cm:name', true);
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':Privacy_level',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.PRIVACY_PRIVACY_LEVEL_ASSOCNAME, 'cm:name', true);
					}
				},
				
				{
					name : YammaModel.YAMMA_NS_PREFIX + ':Statusable_status',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.STATUSABLE_EXTENDED_ASSOCNAME, 'cm:name', true);
					}
				}
			
			],
			
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
						
						var enclosingSite = YammaUtils.getSite(trayNode);
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
					
				}
			}
			
	
		}
		
	);
	

})();