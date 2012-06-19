<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/sorting.lib.js">
<import resource="classpath:/alfresco/extension/templates/webscripts/org/alfresco/slingshot/documentlibrary/doclistSearch.lib.js">

(function() {
	
	NodeSearch = function(datasourceDefinition) {
		if (null == datasourceDefinition) {
			throw new Error("A valid datasource-definition has to be provided!");
		}

		this.datasourceDefinition = datasourceDefinition;
		this.deferredFilters = null;
	};

	NodeSearch.PagingHelper = {
		
		/**
		 * Perform a slice of the search result based on the provided page
		 * information
		 * <p>
		 * The searchResult is supposed to contain the complete set of nodes
		 * without any previous paging slice operation
		 * 
		 * @param {int}
		 *            startIndex the index from which to get result
		 * @param {int}
		 *            maxItems the maximum number to return
		 *    
		 */
		slice : function(searchResult, startIndex, maxItems, itemsIndexName) {			
			
			var startIndex = startIndex || 0;
			if (typeof(startIndex) != 'number' ) {
				startIndex = Number(startIndex);
			}
			
			var maxItems = maxItems || -1;
			if (typeof(maxItems) != 'number' ) {
				maxItems = Number(maxItems);
			}
			
			itemsIndexName = itemsIndexName || 'nodes';
			
			var paging = {
				startIndex : startIndex,
				maxItems : maxItems,
				totalRecords : searchResult.count
			}
			
			/*
			 * In order to get the totalRecords property we need to retrieve
			 * the whole set of nodes and slice it after.
			 * A potential optimization would consist in doing such thing only
			 * the first time, relying next on the paging capabilities of the
			 * Alfresco search (supposing the totalrecords is provided by the
			 * client at the second call).
			 * Also using a cache technique would probably lead to better performances.
			 * We suppose here to rely on caching techniques of the underlying
			 * Alfresco layer. 
			 */
			var items = searchResult[itemsIndexName];
			if (startIndex >= 0 && maxItems > 0) {
				items = items.slice(startIndex, startIndex + maxItems);
				searchResult[itemsIndexName] = items;
				searchResult.count = items.length;
			}
			items = null;
			
			searchResult.paging = paging;
			
			return searchResult;
		}
		
	}
	
	
	
	NodeSearch.prototype.buildLuceneQuery = function (filters) {
	
		var filterQuery = "";
		
		var baseSearchPath = this.datasourceDefinition.getBaseSearchPath && this.datasourceDefinition.getBaseSearchPath();
		if (baseSearchPath) { // non-undefined, non-null and non-empty			
			filterQuery += '+PATH:\"' + baseSearchPath + '\"';
		}
		
		var baseSearchType = this.datasourceDefinition.getBaseSearchType && this.datasourceDefinition.getBaseSearchType();
		if (baseSearchType) {			
			filterQuery += " +TYPE:\"" + baseSearchType + "\"";
		}
				
		filterQuery = this.applyQueryFilters(filterQuery, filters);
		filterQuery = this.postProcessQuery(filterQuery);
		
		return filterQuery;
	};
	
	NodeSearch.prototype.postProcessQuery = function(query) {
		
		var searchAdditional = this.datasourceDefinition.getSearchAdditional();
		if (!searchAdditional) return query;
		
		var postProcessQuery = searchAdditional.postProcessQuery;
		if (!postProcessQuery) return query;
		if (!(postProcessQuery instanceof Function)) return query;
		
		var postQuery = postProcessQuery(query);
		if (!postQuery) return query;

		return postQuery;
		
	};
	
	NodeSearch.prototype.applyQueryFilters = function(query, filters) {
		var me = this;
		me.deferredFilters = [];
		filters = filters || [];
		
		Utils.forEach(filters,
		
			function(filter) {
				var filterId = filter.property;
				if (!filterId) return;
				
				var filterDef = me.datasourceDefinition.getFilter(filterId);
				if (!filterDef) return; // no filter definition
				
				if (filterDef.acceptNode) { // post-filter definition
					me.deferredFilters.push({
						def : filterDef,
						value : filter.value
					});
					return;
				}
				
				if (!filterDef.applyQueryFilter) return; // not the kind of expected filter definition => ignore
				query = filterDef.applyQueryFilter.call(me.datasourceDefinition, query, filter.value);
			}
			
		);
		
		return query;
	};
	

	
	/**
	 * Method that retrieves a list of nodes from Alfresco, based on the given
	 * search parameters.
	 * @param {Object} searchParams a config object
	 * <p>
	 * searchParameters {
	 *    startIndex : int,
	 *    maxItems : int,
	 *    datasourceDefinition : datasourcedef,
	 *    sort : sortdef[]
	 * }
	 * <p>
	 * sortdef {
	 *    column : string,
	 *    ascending : boolean,
	 *    dir : 'ASC/DESC' // choose either ascending or dir definition but not both
	 * }
	 * @return {Object} a resulting Object
	 * <p>
	 * result {
	 *    paging : paging,
	 *    count : int, // the number of nodes returned
	 *    nodes : ScriptNode[],
	 *    query  : string, // the lucene query if in debug mode (?debug=true)
	 * }
	 * <p>
	 * paging {
	 *    startIndex : int,
	 *    maxItems : int,
	 *    totalRecords : int // the total number of nodes of the complete query (without paging)
	 * }
	 */
	NodeSearch.prototype.searchNodes = function (searchParams) {
		
		var me = this;
		var deferredSortParams = []; // this array will be filled as a side effect of getNodes()
		
		var nodes = getNodes();
		var result = getResult(nodes); // A result is just an Object containing the list of nodes with some additional meta-information
		nodes = null; // Removes reference on nodes
		
		applyDeferredFilters(result);
		applyDeferredSorters(result);
		pageResult(result);
		
		return result;

		
		
		// INNER HELPER FUNCTIONS
		
		function getNodes() {
			
			var searchType = me.datasourceDefinition.getSearchType();
			switch (searchType) {
				case 'lucene':
					return searchLucene();
					break;
				case 'selectnode/qpath':
				case 'selectnode/nodeRef':
					return searchSelectNode();
					break;
				default:
					var message = "UnsupportedOperationException! The search of type '" + searchType + "' is not implemented";
					throw new Error(message);
			}
			
		}
		
		function searchLucene() {
			
			var sortConfig = getAlfrescoSortConfig.call(me, searchParams);
			deferredSortParams = sortConfig.deferredSortParams;

			var alfrescoSearchParameters = null;
			if (isAdvancedSearch()) {
				alfrescoSearchParameters = getAdvancedSearchParameters(sortConfig.sortParams);
			} else if (isSavedSearch()){
				alfrescoSearchParameters = getSavedSearchParameters(sortConfig.sortParams);
			} else {
				var filterQuery = me.buildLuceneQuery(searchParams.filters);
				alfrescoSearchParameters = {
					query : filterQuery,
					language : 'lucene', // also default
					sort : sortConfig.sortParams
				}
			}
			
			if (null == alfrescoSearchParameters) return [];
			applyAdditionalSearchParameters(alfrescoSearchParameters);
			
			return search.query(alfrescoSearchParameters);			
		}
		
		/**
		 * Apply additional search parameters that may have been configured in
		 * the searchAdditional section of the datasource definition
		 * <p>
		 * This may be used for example to provide a default paging piece of
		 * information
		 */
		function applyAdditionalSearchParameters(alfrescoSearchParameters) {
			var pageConfiguration = me.datasourceDefinition.getSearchAdditional().page;
			if (!pageConfiguration) return;
			
			if (!alfrescoSearchParameters.page) alfrescoSearchParameters.page = pageConfiguration;
		}
		
		function isAdvancedSearch() {
			return (undefined !== searchParams.query || undefined !== searchParams.term);
		}
		
		function getAdvancedSearchParameters(sortParams) {
			
			var query = searchParams.query || null;
			var term = searchParams.term || null;
			
			var searchDefinition = getSearchDef({
				term : term,
				query : query,
				tag : null,
				sort : sortParams
			});
			
			return searchDefinition;
			
		}
		
		function isSavedSearch() {
			return (undefined !== searchParams.savedSearch);
		}
		
		function getSavedSearchParameters(sortParams) {
			var savedSearchNodeRef = searchParams.savedSearch;
			if (!savedSearchNodeRef) return null;
			
			var queryDef = getSavedSearchQueryDef(savedSearchNodeRef);	
			if (!queryDef) return null;
			
			if (sortParams) queryDef.sort = sortParams;
			
			return queryDef;
		}
		
		function searchSelectNode() {
			deferredSortParams = searchParams.sort || []; // All search parameters are deferred
			
			// Get the root node
			var rootNode = getRootNode();
			if (!rootNode) return [];
			
			// Get the XPath children expression
			var expression = me.datasourceDefinition.getSearchAdditional().selectnode;
			if (!expression) return [];
			
			expression = me.applyQueryFilters(expression, searchParams.filters);
			expression = me.postProcessQuery(expression);
			
			return rootNode.childrenByXPath(expression);
			
			function getRootNode() {
				var rootNode;
				switch(me.datasourceDefinition.getSearchType()) {
					
					case 'selectnode/qpath':
					rootNode = getRootNodeByQPath();
					break;
					
					case 'selectnode/nodeRef':
					rootNode = getRootNodeByNodeRef();
					break;
					
				}
				return rootNode;
			}
			
			function getRootNodeByQPath() {
				
				var baseSearchPath = me.datasourceDefinition.getBaseSearchPath();
				if (null == baseSearchPath) return;
				var luceneQuery = 
					'PATH:\"' +
					baseSearchPath +
					'\"';
				var rootNodes = search.luceneSearch(luceneQuery);
				if (rootNodes.length == 0) return;
				if (rootNodes.length > 1) {
					var message = "UnsupportedOperationException! The path '" + baseSearchPath + "' returned multiple nodes.";
					throw new Error(message);
				}
				return rootNodes[0];
				
			}
			
			function getRootNodeByNodeRef() {
				
				var indexedFilters = Utils.ArrayToMap(
					searchParams.filters,
					function(filter) { return filter.property; }
				);
				var nodeRefFilter = indexedFilters['nodeRef'];
				if (!nodeRefFilter)
					throw new Error('IllegalStateException! This datasource needs a nodeRef filter');
				
				var nodeRefValue = nodeRefFilter.value;
				if (!nodeRefValue)
					throw new Error('IllegalStateException! This datasource needs a nodeRef filter value');
				
				var rootNode = search.findNode(nodeRefValue);
				return rootNode; // root-node may be null here
			}
		}
		
		function getResult(nodes) {
			
			var result = {
				count : nodes.length,
				nodes : nodes
			}
			
			// Returns also the query if in debug mode
			if (args["debug"]) result.query = filterQuery;
			
			return result;
		}
		
		/**
		 * Filters node based on the deferred filters parameters. These filter
		 * methods use an acceptNode(node, value) method to determine if the
		 * node has to be accepted.
		 */
		function applyDeferredFilters(result) {
			if (!me.deferredFilters || 0 == me.deferredFilters.length) return;
			
			var filteredNodes = [];
			Utils.forEach(result.nodes,
				function(node) {
					if (!isNodeAccepted(node)) return; // continue
					filteredNodes.push(node);
				}
			);
			
			result.nodes = filteredNodes;
			result.count = filteredNodes.length;
		}
		
		function isNodeAccepted(node) {
			var isNodeAccepted = true;
			
			Utils.forEach(me.deferredFilters,
				function(filter) {
					isNodeAccepted = filter.def.acceptNode(node, filter.value);
					if (!isNodeAccepted) return false; // stop iteration
				}
			);
			
			return isNodeAccepted;
		}
		
		function applyDeferredSorters(result) {
			
			// If the sorting is deferred (non-native column), then sort the result
			// and page it
			if (deferredSortParams.length > 0) {
				var sorter = new Sorter(me.datasourceDefinition);
				result.nodes = sorter.sort(result.nodes, deferredSortParams);
			}
			
		}
		
		function pageResult(result) {
			NodeSearch.PagingHelper.slice(result, searchParams.startIndex, searchParams.maxItems);		
		}
		
	};

	/**
	 * Private function to get the sorting parameters conforming to
	 * Alfresco/Lucene search
	 * <p>
	 * The sort parameters are only taken into account in lucene queries if we
	 * refers to native fields (i.e. fields that are not computed)
	 * 
	 * @return {Object} a resulting object of sort-config objects
	 * <code>
	 *         <p>
	 *         {
	 *         		deferredSortParams : search[],
	 *         		sortParams : search[]
	 *         }
	 *         <p>
	 *         search { 
	 *         		column : string, 
	 *         		ascending : boolean 
	 *         }
	 * </code>
	 * @private
	 */
	function getAlfrescoSortConfig(searchParams) {
		var me = this;
		var sortParams = searchParams.sort || [];

		// Add default additional search parameters if any
		var searchAdditional = this.datasourceDefinition.getSearchAdditional();
		if (undefined !== searchAdditional) {
			var sortBy = searchAdditional.sortBy;
			if (sortBy) {
				sortParams = [].concat(sortParams).concat(sortBy);
			}
		} 
		
		var adaptedSortParams = [];
		var deferredSortParams = [];
		
		Utils.forEach(
		
			sortParams,
		
			/* operation */
			function(sortParam) {				
				
				if (isDeferred(sortParam)) {
					deferredSortParams.unshift(sortParam); // unshift because in reverse order
				} else {
					var adaptedSortParam = adaptSortParam(sortParam);
					adaptedSortParams.unshift(adaptedSortParam); // unshift because in reverse order
				}
				
			},
			
			/* reverse */
			true
			
		);
		
		return {
			deferredSortParams : deferredSortParams,
			sortParams : adaptedSortParams
		}		
		
		/**
		 * Check whether the provided sorting-parameters are valid
		 * <p>
		 * @return {boolean} true if the sorting parameter should be taken into account
		 */
		function checkSortParam(sortParam) {
			var columnName = sortParam.column;
			if (null == columnName) {
				throw new Error("IllegalStateException! The provided sort-parameter does not contain a valid column-name");					
			}
			
			if (undefined !== sortParam.ascending && undefined !== sortParam.dir) {
				throw new Error("IllegalStateException! The provided sort-parameter contains both 'ascending' and 'dir' parameter");
			}
			
		}
		
		
		/**
		 * A sort param is deferred if it is a non-native column OR if any
		 * non-native column has been deferred
		 */
		function isDeferred(sortParam) {
			if (deferredSortParams.length > 0) return true;
			
			var sortColumnName = sortParam.column;
			if (!sortColumnName) throw new Error('IllegalStateException! The provided sort-param is not valid');
			
			var fieldDefinition = me.datasourceDefinition.getFieldDefinition(sortColumnName);
			if (null == fieldDefinition) return true; // undefined => maybe a composite field, else will provoke an error later
			
			return !fieldDefinition.isNative();
		}
		
		function adaptSortParam(sortParam) {
			
			checkSortParam(sortParam);
			
			var field = me.datasourceDefinition.getFieldDefinition(sortParam.column);
			var propertyName = field.getPropertyName();
			
			var adaptedSortParam =
				{
					column : '@' + propertyName,
					ascending : (undefined !== sortParam.ascending) ? sortParam.ascending : 'ASC' === sortParam.dir  
				}
			;
			
			return adaptedSortParam;
		}
		
	}		
	
	/*
	 * ALFRESCO SEARCH PARAMETERS
	 * 
     * search
     * {
     *    query: string,          mandatory, in appropriate format and encoded for the given language
     *    store: string,          optional, defaults to 'workspace://SpacesStore'
     *    language: string,       optional, one of: lucene, xpath, jcr-xpath, fts-alfresco - defaults to 'lucene'
     *    templates: [],          optional, Array of query language template objects (see below) - if supported by the language 
     *    sort: [],               optional, Array of sort column objects (see below) - if supported by the language
     *    page: object,           optional, paging information object (see below) - if supported by the language
     *    namespace: string,      optional, the default namespace for properties
     *    defaultField: string,   optional, the default field for query elements when not explicit in the query
     *    onerror: string         optional, result on error - one of: exception, no-results - defaults to 'exception'
     * }
     * 
     * sort
     * {
     *    column: string,         mandatory, sort column in appropriate format for the language
     *    ascending: boolean      optional, defaults to false
     * }
     * 
     * page
     * {
     *    maxItems: int,          optional, max number of items to return in result set
     *    skipCount: int          optional, number of items to skip over before returning results
     * }
     * 
     * template
     * {
     *    field: string,          mandatory, custom field name for the template
     *    template: string        mandatory, query template replacement for the template
     * }
	 */


	
})();
