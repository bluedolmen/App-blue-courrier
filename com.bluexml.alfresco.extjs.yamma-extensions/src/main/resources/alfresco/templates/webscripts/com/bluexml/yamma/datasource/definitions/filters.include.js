(function() {
	
	CommonDatasourceFilters = {
		
		'term' : {
				
			applyQueryFilter : function(query, term) {
				
				if (!term) return query;
				
				var referenceFilter = Utils.Alfresco.getLuceneAttributeFilter(
					YammaModel.REFERENCEABLE_REFERENCE_PROPNAME, 
					term
				);
				
				var nameFilter = Utils.Alfresco.getLuceneAttributeFilter(
					'cm:name', 
					term
				);
				
				return query + ' +(' + referenceFilter + ' ' + nameFilter + ' TEXT:"' + term + '" )';
				
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