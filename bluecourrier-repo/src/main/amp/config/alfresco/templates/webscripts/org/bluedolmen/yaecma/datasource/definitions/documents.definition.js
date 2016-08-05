(function() {

	function getNodeFromRef(nodeRef) {
		
		var 
			node = null
		; 
		
		if ('root' != nodeRef) {
			
			node = Utils.Alfresco.getExistingNode(nodeRef);
			if (null != node) return node;
			
			logger.warn('Cannot find any matching and unique parent reference based on value \'' + nodeRef + '\'.');
			
		}
		
		return Utils.Alfresco.getCompanyHome();
			
	}
	

	DatasourceDefinitions.register('documents',
		{
					
			searchAdditional : {
				
				postProcessQuery : function(query, mappedFilters) {
					
					var
						parentRef = mappedFilters['parent'],
						parentNode = getNodeFromRef(parentRef),
						showHidden = mappedFilters['showHidden'] === true || mappedFilters['showHidden'] == 'true',
						
						fileFoldersQuery = Yaecma.Utils.buildFileFoldersLuceneQuery({
							parent : Utils.asString(parentNode.nodeRef),
							showHidden : showHidden
						})
					
					;
					
					return fileFoldersQuery + (query || '');					
				},
				
				sortBy : {
					column : 'cm:name',
					dir : 'ASC'
				},
				
				metadata : function(params) {
					
					function getNodeDescription(node) {
						
						node = Utils.Alfresco.getExistingNode(node);
						if (null == node) return {};
						
						return {
							nodeRef : Utils.asString(node.nodeRef),
							name : node.name
						};
					}
					
					var 
						mappedFilters = params.getMappedFilters(),
						parentRef = mappedFilters['parent'],
						rootRef = mappedFilters['root'],
						rootNode = getNodeFromRef(rootRef)						
					;
					
					if (!parentRef) return null;
					
					var
						parentNode = getNodeFromRef(parentRef),
						ancestors = [],
						doc = parentNode
					;
										
					while (null != doc && doc.hasPermission('Read')) {
						if (rootNode.equals(doc)) break; // relies here on Java equality
						
						ancestors.push(doc);
						doc = doc.parent;
					}
					ancestors.push(rootNode);
					
					return {
						parent : getNodeDescription(parentNode),
						ancestors : Utils.map(ancestors, function(ancestor) { return getNodeDescription(ancestor); })
					};
				}
				
			},						
			
			fields : [
				
				'@nodeRef*',
				'cm:name',
				'cm:title',
				
				{
					name : "owner",
					evaluate : function(node) {
						var owner = node.owner || '';
						return Datasource.Helpers.getPersonDescription(owner);
					}
				},
				
				{
					name : "creator",
					evaluate : function(node) {
						var creator = node.properties['cm:creator'] || '';
						return Datasource.Helpers.getPersonDescription(creator);
					}
				},
				
				{
					name : "modifier",
					evaluate : function(node) {
						var modifier = node.properties['cm:modifier'] || '';
						return Datasource.Helpers.getPersonDescription(modifier);
					}
				},
				
				'cm:created',
				'cm:modified',
				
				'@isContainer/boolean',
				'@mimetype',
				'@size/int',

				'cm:versionLabel',
				
				{
					name : 'permissions',
					type : 'object',
					evaluate : function(node) {
						
						var result = {							
							user : {
								CancelCheckOut: node.hasPermission('CancelCheckOut'),
								ChangePermissions: node.hasPermission('ChangePermissions'),
								CreateChildren: node.hasPermission('CreateChildren'),
								Delete: node.hasPermission('Delete'),
								Write: node.hasPermission('Write')								
							}
						};
						
						if (node.hasPermission('ReadPermissions')) {
							result.roles = node.getPermissions();
						}
						
						return result;
					}
				}

				
			],
			
			filters : {			
				
				'term' : CommonDatasourceFilters['term'],
				
				'nodeRef' : CommonDatasourceFilters['nodeRef']
			
			}
			
	
		}
		
	);

})();