(function(){
		
	DatasourceDefinitions.register('OpenSearch',
	{
		baseSearchPath : 'app:company_home/st:sites//*',
		baseSearchType : YammaModel.DOCUMENT_TYPE_SHORTNAME,

		searchAdditional : {
			page : {
				maxItems: 10,
				skipCount: 0
			},
			sortBy : {
				column : 'cm:name',
				dir : 'ASC'
			}
		},
		
		fields : [
			'@nodeRef',
			'@typeShort',
			'cm:name',
			'cm:title',
			YammaModel.REFERENCEABLE_REFERENCE_PROPNAME
		],
		
		filters : {
			
			'term' : CommonDatasourceFilters['term']
			
		}
		
		
	});
	
})();