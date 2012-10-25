/**
 * ParseArgs singleton
 * <p>
 * Helper to parse arguments, manage error status and parameter standardization
 */
var ParseArgs = {
	
	getIntParam : function (paramName, defaultValue) {
		var param = args[paramName] || defaultValue;
		if (typeof(param) == 'number') return param;
		
		return Number(param);
	},
	
	/**
	 * Main function parsing webscript arguments
	 * @return {Object} a resulting Object
	 * <p>
	 * result {
	 *    datasourceId : string,
	 *    startIndex : int,
	 *    maxItems : int,
	 *    sort : sortdef[],
	 *    filters : filterdef[],
	 *    query? : formData, // as defined by the Alfresco search library (a JSON string)
	 *    term : string      // as defined by the Alfresco search library (a space-separated list of terms),
	 *    savedSearch : string // only the nodeRef is supported for the moment
	 * }
	 * <p>
	 * sortdef {
	 *    column : string,
	 *    dir : string('ASC'|'DESC')
	 * }
	 * <p>
	 * filterdef : {
	 *    property : string,
	 *    value : string
	 * }
	 */
	parse : function() {
		
		var datasourceId = url.templateArgs.datasourceId;
		if (null == datasourceId) {
			var message = "The 'datasourceId' argument has to be provided";
			status = status.setCode(412, message);
			return null;
		}
		
		var params = {
			
			datasourceId : datasourceId,
			startIndex : this.getIntParam("start", 0),
			maxItems : this.getIntParam("maxItems", -1),
			format : args['format'],
			sort : getSort("group").concat(getSort()), // grouping is also a (prioritary) sort parameter
			filters : getFilters(),
			fieldFilters : getFieldFilters(),
			
			getMappedFilters : function() {
				var filters = this.filters || [];
				var mappedFilters = {};
				Utils.forEach(filters, function(filter) {
					mappedFilters[filter.property] = filter.value;
				});
				return mappedFilters;
			},
			
			getFilterValue : function(filterName) {
				
				var mappedFilters = this.getMappedFilters();
				return mappedFilters[filterName] || null;
				
			}
		};
		
		var query = args['query'];
		if (null != query) {
			params.query = query;
		}
		
		var term = args['term'];
		if (null != term) {
			params.term = term;
		}
		
		var savedSearch = args['savedSearch'];
		if (savedSearch) {
			if (savedSearch.indexOf('workspace://SpacesStore') != 0) {
				var message = 'UnsupportedOperationException! The provided saved-search is not supported yet; should be a valid nodeRef';
				status = status.setCode(status.STATUS_BAD_REQUEST, message);
				throw new Error(message);
			}
			params.savedSearch = savedSearch;
		}
		
		return params;
		
		/**
		 * The sort parameter is formatted as :
		 * SORT_PARAM ::= SORT_CHUNK | (SORT_CHUNK ',' SORT_PARAM)
		 * SORT_CHUNK ::= FIELD_NAME '#' FILTER_DIR
		 * FIELD_NAME ::= [A-Za-z0-9_:]+
		 * FILTER_DIR ::= 'ASC' | 'DESC'
		 * <p>
		 * The result of the function is a list of Object-s of the form:
		 * {
		 *    column : string,
		 *    dir : string ('ASC'|'DESC')
		 * }
		 */
		function getSort(sortParamName) {
			
			sortParamName = sortParamName || "sort";
			
			var sortParam = args[sortParamName];
			if (null == sortParam) return [];				
			
			var sortChunks = sortParam.split(',');
			var result = Utils.map(sortChunks,
				function(sortChunk) {
					var sharpPosition = sortChunk.lastIndexOf('#');
					var dir = 'ASC';
					var property = sortChunk;
					
					if (sharpPosition > 0) {
						dir = sortChunk.substring(sharpPosition + 1);
						
						if ("ASC" != dir && "DESC" != dir) {
							var message = "IllegalArgumentException! The provided sort-direction '" + dir + "' is not valid w.r.t. the 'dir' param (ASC/DESC)";
							status = status.setCode(412, message);
							throw new Error(message);
						}
						
						property = sortChunk.substring(0, sharpPosition);
					}
					
					return {
						column : property,
						dir : dir
					}
				}
			);
			
			return result.slice(result.length - 1); // Only keep the last sorting parameter
		}
		
		function getFieldFilters() {
			
			var fieldsParam = args["fields"];
			if (null == fieldsParam) return null;

			if (fieldsParam.indexOf('[') == 0) {
				
				if (fieldsParam.indexOf('function') > 0 || fieldsParam.indexOf('()') > 0) {
					throw new Error('IllegalStateException! The provided fieldsParam cannot contain any function definition or call.');
				}
				
				var fieldFilters = eval(fieldsParam);
				return fieldFilters;
				
			} else {
				throw new Error('IllegalStateException! The provided filterParam is not supported anymore, you may use the array form instead.')
			}
			
		}
		
		function getFilters() {
			
			var filters = getImpliedFilters();
			
			var filterParam = args["filter"];
			if (null == filterParam) return filters;

			if (filterParam.indexOf('[') == 0) {
				
				// TODO: The use of eval is unsafe
				// but using jsonUtils.toObject seems to not longer works on version 3.4.8
				
				// Light checking => May provide limit in filter naming/filtering-value
				if (filterParam.indexOf('function') > 0 || filterParam.indexOf('()') > 0) {
					throw new Error('IllegalStateException! The provided filterParam cannot contain any function definition or call.');
				}
				
				var filterDefs = eval(filterParam);
				filters = filters.concat(filterDefs);
				
			} else {
				throw new Error('IllegalStateException! The provided filterParam is not supported anymore, you may use the array form instead.')
//				var filterDef = jsonUtils.toObject(filterParam); 
//				filters.push(translateFilter(filterDef));
			}

			return filters;

			/**
			 * This method defines an array of filters from the given arguments
			 * which are not targeted to other purposes. This way, passing some
			 * filters is really simplified
			 * <p>
			 * The argument name has to start with a '@' character to avoid unwanted
			 * collisions
			 */
			function getImpliedFilters() {
				
				var filters = [];
				
				for (var arg in args) {
					if (arg.indexOf('@') != 0) continue;
					
					filters.push(
						{
							property : arg.substr(1),
							value : args[arg]
						}
					);
				};
				
				return filters;
			}
			 
		}		
		
	}
	
}
