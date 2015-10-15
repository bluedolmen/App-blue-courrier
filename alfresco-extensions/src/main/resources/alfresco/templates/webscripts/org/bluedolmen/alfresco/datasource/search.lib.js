///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/sorting.lib.js">

(function() {

	/**
	 * getSearchResults ant its dependencies is actually extracted from the
	 * source code of Alfresco 4.2.
	 * 
	 * It should be cleaned-up and simplified (the method is really long)
	 */
	
	var DEFAULT_MAX_RESULTS = 250;
	var SITES_SPACE_QNAME_PATH = "/app:company_home/st:sites/";
	
	/**
	 * Helper to escape the QName string so it is valid inside an fts-alfresco query.
	 * The language supports the SQL92 identifier standard.
	 * 
	 * @param qname   The QName string to escape
	 * @return escaped string
	 */
	function escapeQName(qname) {
		
		var 
			separator = qname.indexOf(':'),
			namespace = qname.substring(0, separator),
			localname = qname.substring(separator + 1)
		;

		return escapeString(namespace) + ':' + escapeString(localname);
		
	}

	function escapeString(value) {
		
	   var result = "";

	   for (var i=0,c; i<value.length; i++) {
		   
	      c = value.charAt(i);
	      if (i == 0) {
	         if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_')) {
	            result += '\\';
	         }
	      }
	      else {
	         if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_' || c == '$' || c == '#')) {
	            result += '\\';
	         }
	      }
	      
	      result += c;
	   }
	   
	   return result;
	   
	}
	 
	/**
	 * Helper method used to determine whether the property value is multi-valued.
	 *
	 * @param propValue the property value to test
	 * @param modePropValue the logical operand that should be used for multi-value property
	 * @return true if it is multi-valued, false otherwise
	 */
	function isMultiValueProperty(propValue, modePropValue) {
		
	   return modePropValue != null && propValue.indexOf(",") !== -1;
	   
	}

	/**
	 * Helper method used to construct lucene query fragment for a multi-valued property.
	 *
	 * @param propName property name
	 * @param propValue property value (comma separated)
	 * @param operand logical operand that should be used
	 * @param pseudo is it a pseudo property
	 * @return lucene query with multi-valued property
	 */
	function processMultiValue(propName, propValue, operand, pseudo) {
		
		var 
			multiValue = propValue.split(","),
			formQuery = ""
		;
		
		for (var i = 0; i < multiValue.length; i++) {
			
			if (i > 0) {
				formQuery += ' ' + operand + ' ';
			}
	      
			if (pseudo) {
				formQuery += '(cm:content.' + propName + ':"' + multiValue[i] + '")';
			}
			else {
				formQuery += '(' + escapeQName(propName) + ':"' + multiValue[i] + '")';
			}
		}
	   
		return formQuery;
		
	}
	
	function resolveRootNode(reference) {
		
	   var node = null;
	   
	   try {
	      if (reference == "alfresco://company/home") {
	         node = "";
	      }
	      else if (reference == "alfresco://user/home") {
	         node = userhome;
	      }
	      else if (reference == "alfresco://sites/home") {
	         node = companyhome.childrenByXPath("st:sites")[0];
	      }
	      else if (reference == "alfresco://shared") {
	         node = companyhome.childrenByXPath("app:shared")[0];
	      }
	      else if (reference.indexOf("://") > 0) {
	    	  
	         if (reference.indexOf(":") < reference.indexOf("://")) {
	            var newRef = "/" + reference.replace("://", "/");
	            var newRefNodes = search.xpathSearch(newRef);
	            node = search.findNode(String(newRefNodes[0].nodeRef));
	         }
	         else {
	            node = search.findNode(reference);
	         }
	      }
	      else if (reference.substring(0, 1) == "/") {
	         node = search.xpathSearch(reference)[0];
	      }
	      if (node === null) {
	         logger.log("Unable to resolve specified root node reference: " + reference);
	      }
	   }
	   catch (e) {
	      node = null;
	   }
	   
	   return node !== "" ? node : null;
	   
	}
	
	/**
	 * Return Search results with the given search terms.
	 * 
	 * "or" is the default operator, AND and NOT are also supported - as is any other valid fts-alfresco
	 * elements such as "quoted terms" and (bracket terms) and also propname:propvalue syntax.
	 * 
	 * @param params  Object containing search parameters - see API description above
	 */
	function getSearchResults(params) {
		
		var 
			nodes,
			ftsQuery = "",
			term = params.term,
			tag = params.tag,
			formData = params.query,
			rootNode = params.rootNode ? resolveRootNode(params.rootNode) : null,
			formQuery = "",
			formJson, first, useSubCats, propValue, propName,
			firstCat, catQuery, cats, cat, catNode,
			index,
			from, to, sepindex,
			path,
			sortColumns, sort, asc, separator, column,
			queryDef,
			datatype, aspects, aspect, i, len
		;
	   
	   	// Simple keyword search and tag specific search
		if (term !== null && term.length !== 0) {
	      // TAG is now part of the default search macro
			ftsQuery = term + " ";
		}
		else if (tag !== null && tag.length !== 0) {
	      	//Just look for tag
			ftsQuery = "TAG:" + tag +" ";
		}
	   
		// Advanced search form data search.
		// Supplied as json in the standard Alfresco Forms data structure:
		//    prop_<name>:value|assoc_<name>:value
		//    name = namespace_propertyname|pseudopropertyname
		//    value = string value - comma separated for multi-value, no escaping yet!
		// - underscore represents colon character in name
		// - pseudo property is one of any cm:content url property: mimetype|encoding|size
		// - always string values - interogate DD for type data
		// - an additional "-mode" suffixed parameter for a value is allowed to specify
		//   either an AND or OR join condition for multi-value property searches
		if (formData !== null && formData.length !== 0) {
			
		   formJson = jsonUtils.toObject(formData);
	      
		   // extract form data and generate search query
		   first = true;
		   useSubCats = false;
		   for (var p in formJson) {
			   
			   // retrieve value and check there is someting to search for
			   // currently all values are returned as strings
			   propValue = formJson[p], modePropValue = formJson[p + "-mode"];
			   if (propValue.length !== 0) {
				   
				   if (p.indexOf("prop_") === 0 && p.match("-mode$") != "-mode") {
	               // found a property - is it namespace_propertyname or pseudo property format?
					   propName = p.substr(5);
					   if (propName.indexOf("_") !== -1) {
						   // property name - convert to DD property name format
						   propName = propName.replace("_", ":");
	                  
						   // special case for range packed properties
						   if (propName.match("-range$") == "-range") {
							   // currently support text based ranges (usually numbers) or date ranges
							   // range value is packed with a | character separator
	                     
							   // if neither value is specified then there is no need to add the term
							   if (propValue.length > 1) {
   
								   from, to, sepindex = propValue.indexOf("|");
								   if (propName.match("-date-range$") == "-date-range") {
									   // date range found
									   propName = propName.substr(0, propName.length - "-date-range".length)
	                           
									   // work out if "from" and/or "to" are specified - use MIN and MAX otherwise;
									   // we only want the "YYYY-MM-DD" part of the ISO date value - so crop the strings
									   from = (sepindex === 0 ? "1970-01-01" : propValue.substr(0, 10)); // MIN is NOT WORKING on Alfresco 4.2.2
									   to = (sepindex === propValue.length - 1 ? "MAX" : propValue.substr(sepindex + 1, 10));
								   }
								   else {
									   // simple range found
									   propName = propName.substr(0, propName.length - "-range".length);
	                           
									   // work out if "min" and/or "max" are specified - use MIN and MAX otherwise
									   from = (sepindex === 0 ? "MIN" : propValue.substr(0, sepindex));
									   to = (sepindex === propValue.length - 1 ? "MAX" : propValue.substr(sepindex + 1));
								   }
								   
								   formQuery += (first ? '' : ' AND ') + escapeQName(propName) + ':"' + from + '".."' + to + '"';
								   first = false;
							   }
						   }
						   else if (propName.indexOf("cm:categories") != -1) {
							   // determines if the checkbox use sub categories was clicked
							   if (propName.indexOf("usesubcats") == -1) {
								   if (formJson["prop_cm_categories_usesubcats"] == "true") {
									   useSubCats = true;
								   }
	                        
								   // build list of category terms to search for
								   firstCat = true;
								   catQuery = "";
								   cats = propValue.split(',');
								   
								   for (var i = 0; i < cats.length; i++) {
									   cat = cats[i];
									   catNode = search.findNode(cat);
									   if (catNode) {
										   catQuery += (firstCat ? '' : ' OR ') + "PATH:\"" + catNode.qnamePath + (useSubCats ? "//*\"" : "/member\"" );
										   firstCat = false;
									   }
								   }
	                        
								   if (catQuery.length !== 0) {
									   // surround category terms with brackets if appropriate
									   formQuery += (first ? '' : ' AND ') + "(" + catQuery + ")";
									   first = false;
								   }
							   }
						   }
						   else if (isMultiValueProperty(propValue, modePropValue)) {
							   formQuery += (first ? '(' : ' AND (');
							   formQuery += processMultiValue(propName, propValue, modePropValue, false);
							   formQuery += ')';
							   first = false;
						   }
						   else {
							   
							   if (propValue.charAt(0) === '"' && propValue.charAt(propValue.length-1) === '"') {
								   formQuery += (first ? '' : ' AND ') + escapeQName(propName) + ':' + propValue;
							   }
							   else {
								   index = propValue.lastIndexOf(" ");
								   formQuery += (first ? '' : ' AND ') + escapeQName(propName)
								   if (index > 0 && index < propValue.length - 1) {
									   formQuery += ':(' + propValue + ')';
								   }
								   else {
									   formQuery += ':"' + propValue + '"';
								   }
							   }
							   
							   first = false;
						   }
					   }
					   else {
						   
						   if (isMultiValueProperty(propValue, modePropValue)) {
							   // multi-valued pseudo cm:content property - e.g. mimetype, size or encoding
							   formQuery += (first ? '(' : ' AND (');
							   formQuery += processMultiValue(propName, propValue, modePropValue, true);
							   formQuery += ')';
						   }
						   else {
							   // special case for size-range property
							   if (propName.match("size-range$") == "size-range" && propValue.length > 1) {
								   
								   from, to, sepindex = propValue.indexOf("|");
								   propName = propName.substr(0, propName.length - "-range".length);

								   // work out if "min" and/or "max" are specified - use MIN and MAX otherwise
								   from = (sepindex === 0 ? "MIN" : propValue.substr(0, sepindex));
								   to = (sepindex === propValue.length - 1 ? "MAX" : propValue.substr(sepindex + 1));

								   formQuery += (first ? '' : ' AND ') + '@cm\\:content.' + propName + ':[' + from + ' TO ' + to + ']';
							   }				  
							   else {
								   // single pseudo cm:content property - e.g. mimetype, size or encoding
								   formQuery += (first ? '' : ' AND ') + 'cm:content.' + propName + ':"' + propValue + '"';
							   }
						   }
						   first = false;
					   }
				   }
			   }
		   }
	      
		   if (formQuery.length !== 0 || ftsQuery.length !== 0) {
			   // extract data type for this search - advanced search query is type specific
			   ftsQuery = '';
			   datatype = formJson.datatype;
			   if (null != sideDictionary.getType(datatype)) {
				   ftsQuery += 'TYPE:"' + formJson.datatype + '"';
			   }
			   else if (null != sideDictionary.getAspect(datatype)) {
				   ftsQuery += 'ASPECT:"' + formJson.datatype + '"';
			   }
			   
			   ftsQuery += (formQuery.length !== 0 ? ' AND (' + formQuery + ')' : '') +
			   	   (ftsQuery.length !== 0 ? ' AND (' + ftsQuery + ')' : '')
	           ;
			   
			   aspects = formJson.aspects || [];
			   for (i = 0, len = aspects.length ; i < len; i++) {
				   aspect = aspects[i];
				   ftsQuery += ' AND ASPECT:"' + aspect + '"'
			   }
		   }
	   }
	   
	   if (ftsQuery.length !== 0) {
		   // ensure a TYPE is specified - if no add one to remove system objects from result sets
		   if (ftsQuery.indexOf("TYPE:\"") === -1 && ftsQuery.indexOf("TYPE:'") === -1) {
			   ftsQuery += ' AND (+TYPE:"cm:content" +TYPE:"cm:folder")';
		   }
	      
		   // we processed the search terms, so suffix the PATH query
		   path = null;
		   if (!params.repo) {
			   
			   path = SITES_SPACE_QNAME_PATH;
			   if (params.siteId !== null && params.siteId.length > 0) {
				   path += "cm:" + search.ISO9075Encode(params.siteId) + "/";
			   }
			   else {
				   path += "*/";
			   }
			   
			   if (params.containerId !== null && params.containerId.length > 0) {
				   path += "cm:" + search.ISO9075Encode(params.containerId) + "/";
			   }
			   else {
				   path += "*/";
			   }
		   }
	      
		   // root node - generally used for overridden Repository root in Share
		   if (params.repo && rootNode !== null) {
			   ftsQuery = 'PATH:"' + rootNode.qnamePath + '//*" AND (' + ftsQuery + ')';
		   }
		   else if (path !== null) {
			   ftsQuery = 'PATH:"' + path + '/*" AND (' + ftsQuery + ')';
		   }
		   ftsQuery = '(' + ftsQuery + ') AND -TYPE:"cm:thumbnail" AND -TYPE:"cm:failedThumbnail" AND -TYPE:"cm:rating"';
		   ftsQuery = '(' + ftsQuery + ') AND NOT ASPECT:"sys:hidden"';

			// sort field - expecting field to in one of the following formats:
			//  - short QName form such as: cm:name
			//  - pseudo cm:content field starting with "." such as: .size
			//  - any other directly supported search field such as: TYPE
		   sortColumns = [];
		   sort = params.sort;
		   if (sort != null && sort.length != 0) {
	    	  
			   asc = true;
			   separator = sort.indexOf("|");
			   if (separator != -1) {
				   asc = (sort.substring(separator + 1) == "true");
				   sort = sort.substring(0, separator);
			   }
	         
			   if (sort.charAt(0) == '.') {
				   // handle pseudo cm:content fields
				   column = "@{http://www.alfresco.org/model/content/1.0}content" + sort;
			   }
			   else if (sort.indexOf(":") != -1) {
				   // handle attribute field sort
				   column = "@" + utils.longQName(sort);
			   }
			   else {
				   // other sort types e.g. TYPE
				   column = sort;
			   }
	         
			   sortColumns.push({
				   column: column,
				   ascending: asc
			   });
	         
		   }
	      
		   if (logger.isLoggingEnabled())
			   logger.log("Query:\r\n" + ftsQuery + "\r\nSortby: " + (sort != null ? sort : ""));
	      
		   // perform fts-alfresco language query
		   queryDef = {
				   query: ftsQuery,
				   language: "fts-alfresco",
				   page: {maxItems: params.maxResults * 2},    // allow for space for filtering out results
				   defaultField: "keywords",
				   onerror: "no-results",
				   sort: sortColumns 
		   };
	      
		   nodes = search.query(queryDef);
	      
	   }
	   else {
		   // failed to process the search string - empty list returned
		   nodes = [];
	   }
	   
	   return nodes;
	   
	}
	
	
	
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
	
	
	
	NodeSearch.prototype.buildLuceneQuery = function (searchParams) {
	
		var filterQuery = this.datasourceDefinition.luceneQuery || "";
		
		var baseSearchPath = this.datasourceDefinition.getBaseSearchPath && this.datasourceDefinition.getBaseSearchPath();
		if (baseSearchPath) { // non-undefined, non-null and non-empty			
			filterQuery += '+PATH:\"' + baseSearchPath + '\"';
		}
		
		var baseSearchType = this.datasourceDefinition.getBaseSearchType && this.datasourceDefinition.getBaseSearchType();
		if (null != baseSearchType) {
			// First check aspect since Alfresco returns a warning in case of an unexisting type
			var typeDefinition = sideDictionary.getAspect(baseSearchType);
			if (null == typeDefinition) {
				typeDefinition = sideDictionary.getType(baseSearchType);
			}
			
			filterQuery += " "
				+ ( null != typeDefinition && typeDefinition.isAspect() ? "+ASPECT" : "+TYPE" ) 
				+ ":\"" + baseSearchType + "\"";
		}
		
		filterQuery = this.applyFieldFilters(filterQuery, searchParams.fieldFilters, searchParams.query);
		filterQuery = this.applyQueryFilters(filterQuery, searchParams.filters);
		filterQuery = this.postProcessQuery(filterQuery, searchParams.getMappedFilters());
		
		return filterQuery;
	};
	
	NodeSearch.prototype.applyFieldFilters = function(query, fields, value) {
		var me = this;
		
		if (!value) return query;
		value = Utils.trim(value);
		if (!value || '*' == value) return query;
		
		fields = fields || [];
		
		var additionalQueryFilter = '';
		
		Utils.forEach(fields,
		
			function(field) {
				var fieldDefinition = me.datasourceDefinition.getFieldDefinition(field);
				if (null == fieldDefinition) return true;
				
				if (!fieldDefinition.isNative()) {
					logger.warn("The field-filtering on field '" + field + "' is not supported since not native to the lucene query.");
					return true;
					//throw new Error('UnsupportedOperationException! The field-filtering is only supported on native fields');
				}
				
				additionalQueryFilter += ' ' + Utils.Alfresco.getLuceneAttributeFilter(field, value);
			}
			
		);

		return query + (additionalQueryFilter ? '+(' + additionalQueryFilter + ')' : '');
		
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
	
	NodeSearch.prototype.postProcessQuery = function(query, mappedFilters) {
		
		var searchAdditional = this.datasourceDefinition.getSearchAdditional();
		if (!searchAdditional) return query;
		
		var postProcessQuery = searchAdditional.postProcessQuery;
		if (!postProcessQuery) return query;
		if (!(postProcessQuery instanceof Function)) return query;
		
		var
			postQuery = postProcessQuery.call(this.datasourceDefinition, query, mappedFilters)
		;
		if (!postQuery) return query;

		return postQuery;
		
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
				return getAdvancedSearchResults(sortConfig.sortParams);
			}
			
			else if (isSavedSearch()){
				alfrescoSearchParameters = getSavedSearchParameters(sortConfig.sortParams);
			}
			
			else {
				var filterQuery = me.buildLuceneQuery(searchParams);
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
			return (undefined !== searchParams.query && !searchParams.fieldFilters) || (undefined !== searchParams.term);
		}
		
		function getAdvancedSearchResults(sortParams) {
			
			var 
				query = searchParams.query || null,
				term = searchParams.term || null,
				firstSortParam = sortParams[0],
				sortParam = firstSortParam ?  firstSortParam.column.replace(/@/,'') + '|' + firstSortParam.ascending : '',
				searchResult,
				alfrescoSearchParameters = { // search.lib.js from alfresco
					term : term,
					siteId : null,
					containerId : null,
					query : query,
					tag : null,
					sort : sortParam,
					maxResults : DEFAULT_MAX_RESULTS
				}
			;
			
			applyAdditionalSearchParameters(alfrescoSearchParameters);
			return getSearchResults(alfrescoSearchParameters);
			
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
		
		function postProcessResult(result) {
			
			if (!result || !Utils.isArray(result.nodes)) return;
			
			var searchAdditional = me.datasourceDefinition.getSearchAdditional();
			if (!searchAdditional) return;
			
			var postProcessResult = searchAdditional.postProcessResult;
			if (!Utils.isFunction(postProcessResult)) return;
			
			result.nodes = postProcessResult.call(result.nodes, me);
			
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

			// An escaped sort-column is always considered as non-deferred (you know what you do here)
			var matchEscaped = /^@.*/.test(sortColumnName);
			if (matchEscaped) return false;
			
			var fieldDefinition = me.datasourceDefinition.getFieldDefinition(sortColumnName);
			if (null == fieldDefinition) return true; // undefined => maybe a composite field, else will provoke an error later
			
			return !fieldDefinition.isNative();
		}
		
		function adaptSortParam(sortParam) {
			
			checkSortParam(sortParam);
			
			var
				columnName = sortParam.column,
				isNative = Utils.String.startsWith(columnName, '@')
			;
			
			if (!isNative) {
				var field = me.datasourceDefinition.getFieldDefinition(sortParam.column);
				columnName = '@' + field.getPropertyName();
			}			
			
			return {
				column : columnName,
				ascending : (undefined !== sortParam.ascending) ? sortParam.ascending : 'ASC' === sortParam.dir  
			};
			
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
