(function() {
	
	CommonDatasourceFilters = {
		
		'term' : {
				
			applyQueryFilter : function(query, term) {
				
				if (!term) return query;
				
				var 
					nameFilter = Utils.Alfresco.getLuceneAttributeFilter(
						'cm:name', 
						term
					),
					
					titleFilter = Utils.Alfresco.getLuceneAttributeFilter(
						'cm:title', 
						term
					) 
				;
				
				return query + ' +(' + nameFilter + ' ' + titleFilter + ')' + ' -TYPE:"cm:folder"';
				
			}				
			
		},
		
		'nodeRef' : {
			
			applyQueryFilter : function(query, nodeRef) {
				
				if (!nodeRef) return query;
				
				query = query + ' +ID:"' + nodeRef + '"';
				return query;
			}
			
		}		
		
	};
	
})();