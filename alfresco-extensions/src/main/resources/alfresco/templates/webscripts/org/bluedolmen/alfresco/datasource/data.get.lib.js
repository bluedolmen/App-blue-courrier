///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/utils/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/helpers.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/definitions.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/search.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/evaluator.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/aggregator.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/parseargs.lib.js">

// STANDARD DEFINITIONS

function buildData(datasourceDefinition, params) {	
		
	var 
		result = buildNodeList(datasourceDefinition, params),
		evaluator = new Evaluator(datasourceDefinition),
		dataList = evaluator.evaluateList(result.nodes)
	;
	
	if (dataList.length > result.count) {
		/*
		 * TODO. Implement the missing part...
		 * The number of results may have changed due to a join operation.
		 * However returning a modified number of results should lead to a
		 * specific processing regarding the pagination, which is not yet
		 * supported by this part of code (paging should be deferred to this
		 * point, which may not be optimal in case where no-join operation is
		 * performed).
		 */
		throw new Error('UnsupportedOperationException! The join operation on properties returning a list of values is not yet implemented.');
	}
	
	result.items = dataList;
	delete result.nodes;
	
	return result;
}

function buildNodeList(datasourceDefinition, params) {
	
	var result = buildExplicitNodeList(datasourceDefinition, params);
	if (!result) {
		// Search the matching list of nodes by using search
		var nodeSearch = new NodeSearch(datasourceDefinition);
		result = nodeSearch.searchNodes(params);
	}
	
	return result;
}

function buildExplicitNodeList(datasourceDefinition, params) {
	// The list of nodes is provided explicitely by a function 
	var 
		searchAdditional = datasourceDefinition.getSearchAdditional(),
		listnodes = searchAdditional.listnodes
	;
	if (!listnodes) return null;
		
	var 
		nodes = listnodes.call(datasourceDefinition, params),
		result = {
			nodes : nodes, 
			count : nodes.length
		}
	;
	NodeSearch.PagingHelper.slice(result, 1, -1);
	return result;
}


// AGGREGATION DEFINITIONS

function buildAggregateData(datasourceDefinition, params) {
	
	// Check whether params contain a formData definition, which is not a legal operation on aggregation
	if (undefined !== params.query || undefined !== params.term) {
		throw new Error('UnsupportedOperationException! The aggregation operation does not support the query or term parameters');
	}
		
	var 
		result = buildAggregateNodeList(datasourceDefinition, params),
		aggregator = new Aggregator(datasourceDefinition),
		dataList = aggregator.evaluateList(result.nodes)
	;
	
	result = {
		count : dataList.length,
		items : dataList
	}
	postProcessAggregate(result, datasourceDefinition, params);
	
	return result;
	
}

function buildAggregateNodeList(datasourceDefinition, params) {
	
	var 
		searchAdditional = datasourceDefinition.getSearchAdditional(),
		delegatedDatasource = datasourceDefinition.getDelegated(),
	
		groupBy = searchAdditional.groupBy,
		delegatedParams = Utils.Object.create(params, {
				
			datasourceId : delegatedDatasource.getDatasourceId(), // no matter
			startIndex : 0,
			maxItems : -1,
			sort : [
				{
					column : groupBy,
					dir : 'ASC'
				}
			]
			// filters are forwarded
			
		})
	;
	
	return buildNodeList(delegatedDatasource, delegatedParams);
}

function postProcessAggregate(result, datasourceDefinition, params) {
	// Sort result if necessary
	var sortingParameters = params.sort;
	if (sortingParameters && sortingParameters.length > 0) {
		var sorter = new Sorter(datasourceDefinition);
		sorter.sortValues(result.items, params.sort);
	}
	
	// Page result if necessary (else just fixes paging information)
	NodeSearch.PagingHelper.slice(result, params.startIndex, params.maxitems, 'items' /* itemsIndexName */);
}

function main() {
	
	// Parse parameters
	var params = ParseArgs.parse();
	if (params == null) return;
	
	model.params = params;
	
	var 
		datasourceId = params.datasourceId,
		datasourceDeclarativeDefinition = DatasourceDefinitions.getDeclarativeDefinition(datasourceId)
	;
	
	if (null == datasourceDeclarativeDefinition) {
		var 
			datasourceIds = DatasourceDefinitions.getDatasourceIds(),
			definedDatasources = Utils.String.join(datasourceIds, ','),
			mesg = "The provided datasourceId '" + datasourceId + "' cannot be found. Here are the datasources defined: " + definedDatasources
		;
		status.setCode(status.STATUS_NOT_FOUND, mesg);
		return;
	}
	
	// manage dynamic mixins
	datasourceDeclarativeDefinition.mixins = 
		(datasourceDeclarativeDefinition.mixins || []).concat(params.mixins);
	
	// Get datasource-definition
	var datasourceDefinition = DatasourceDefinitions.getDefinition(datasourceId);

	var 
		searchType = datasourceDefinition.getSearchType(),
		isAggregate = ('aggregate' === searchType),
		data = isAggregate
			? buildAggregateData(datasourceDefinition, params)
			: buildData(datasourceDefinition, params),
		searchAdditional = datasourceDefinition.getSearchAdditional()
	; 
	
	model.data = data;
	
	/*
	 * Process specific code for CSV binding (e.g. columns)
	 */
	if ('csv' == params.format) {
		model.fields = DatasourceDefinitions.getFlatColumns(datasourceId);
		var 
			columns = datasourceDefinition.getColumns() || params.columns,
			mappedFields
		;
		if (null != columns) { // filter to a subset of fields
			
			mappedFields = Utils.Array.toMap(model.fields, function(field) {return field.name;});
			model.fields = Utils.Array.map(columns, function(columnName) {
				return mappedFields[columnName];
			});
			
		}
	}

	/*
	 * Additional metadata return if necessary
	 */
	if (searchAdditional.metadata) {
		
		var metadata = Utils.isFunction(searchAdditional.metadata) 
			? searchAdditional.metadata.call(datasourceDefinition, params)
			: searchAdditional.metadata
		;
		
		if (metadata) {
			model.metadata = metadata;
		}
		
	}
}
