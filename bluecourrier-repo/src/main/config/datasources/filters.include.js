(function() {
	
	var termCandidateProperties = [
		YammaModel.REFERENCEABLE_REFERENCE_PROPNAME, 
		YammaModel.MAIL_OBJECT_PROPNAME,
		'cm:name',
		'TEXT'
	];
	
	CommonDatasourceFilters = {
		
		'term' : {
				
			applyQueryFilter : function(query, term) {
				
				if (!term) return query;
				
				return ( 
					query +
					
					' +(' +
					
					Utils.String.join(
						Utils.map(termCandidateProperties, function(prop) {
							return Utils.Alfresco.getLuceneAttributeFilter(prop, term);
						}), 
						' '
					) +
					
					')'
				);
				
			}				
			
		},
		
		'nodeRef' : {
			
			applyQueryFilter : function(query, nodeRef) {
				
				if (!nodeRef) return query;
				
				query = query + ' +ID:"' + nodeRef + '"';
				return query;
			}
			
		},
		
		datePropertyRangeFilter : function(property) {
			
			var property_ = property;
			
			return function(query, daysNumber) {
				
				if (null == daysNumber) return query;

				var
					nowInMs = new Date().getTime(),
					xDaysAgo = new Date(nowInMs - (daysNumber * 24 * 60 * 60 * 1000))
				;

				query += 
					' +@' + 
					Utils.escapeQName(property_) +
					':[' + utils.toISO8601(xDaysAgo) + ' TO MAX]'
				;

				return query;
				
			}
			
		}
		
	};
	
})();