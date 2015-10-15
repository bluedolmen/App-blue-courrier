// TODO: Factorize with documents
(function() {
	
	var UNKNOWN_AUTHOR = '(inconnu)'

	DatasourceDefinitions.register('quicksearch',
		{
					
			searchAdditional : {
				
				postProcessQuery : function(query, mappedFilters) {
					
					var
						parent = mappedFilters['parent'],
						showHidden = mappedFilters['showHidden'] === true,
						
						fileFoldersQuery = Yaecma.Utils.buildFileFoldersLuceneQuery({
							parent : parent,
							showFolders : false,
							showHidden : showHidden
						})
					;
					
					return fileFoldersQuery + (query || '');
					
				},
				
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
				
				'@nodeRef*',
				'cm:name',
				'cm:title',
				'@isContainer/boolean'
			],
			
			filters : {
			
				'term' : CommonDatasourceFilters['term'],
				
				'nodeRef' : CommonDatasourceFilters['nodeRef']
			
			}
			
	
		}
		
	);

})();