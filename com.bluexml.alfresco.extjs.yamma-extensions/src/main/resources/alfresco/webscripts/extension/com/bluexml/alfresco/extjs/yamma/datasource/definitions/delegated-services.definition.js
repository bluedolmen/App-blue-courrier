(function() {

	DatasourceDefinitions.register('DelegatedServices',
		{
		
			searchAdditional : {
				
				listnodes : function(params) {
					
					var nodeRef = params.getFilterValue('nodeRef');
					if (!nodeRef)
						throw new Error("[DataSource.DelegatedServices] IllegalStateException! There should be one filter named 'nodeRef'");
					
					var document = search.findNode(nodeRef);
					if (!document)
						throw new Error('[Datasource.DelegatedServices] IllegateStateException! Cannot find a valid document for the given nodeRef: ' + nodeRef);
					
					var enclosingSite = DocumentUtils.getCurrentServiceSite(document);
					return ServicesUtils.getDelegatedServices(enclosingSite);
				}
				
			},
			
			fields : [
				
				'@nodeRef',
				'@typeShort',
				'cm:name',
				'cm:title',
				'cm:description'				
				
			]			
			
	
		}
		
	);

})();