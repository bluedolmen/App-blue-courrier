(function() {
	
	DatasourceDefinitions.register('ancestors',
		{

			searchAdditional : {
				
				listnodes : function(params) {
					
					var 
						nodeRef = params.getFilterValue('nodeRef') || Utils.Error.raise("[DataSource.ancestors] IllegalStateException! There should be one filter named 'nodeRef'"),
						document = search.findNode(nodeRef) || Utils.Error.raise('[Datasource.ancestors] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + nodeRef)
						rootRef = params.getFilterValue('rootRef'),
						nodes = []
					;					
					
					for (var doc = document ; doc = document.parent ; null != doc && doc.hasPermission('Read')) {
						if (doc.nodeRef == rootRef) break;
						nodes.push(doc);
					}
					
					return nodes;
				}
								
			},			
			
			fields : [
				
				'@nodeRef*',
				'@name',
				'cm:title'
			],
			
			filters : {
			
				'nodeRef' : CommonDatasourceFilters['nodeRef']
			
			}
			
	
		}
		
	);

})();