<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/common.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/definitions.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/search.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/evaluator.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/aggregator.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/parseargs.lib.js">

// STANDARD DEFINITIONS

function buildData(datasourceDefinition, params) {	
		
	var result = buildNodeList(datasourceDefinition, params);
	var evaluator = new Evaluator(datasourceDefinition);
	var dataList = evaluator.evaluateList(result.nodes);
	
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
	var searchAdditional = datasourceDefinition.getSearchAdditional();
	var listnodes = searchAdditional.listnodes;
	if (!listnodes) return null;
		
	var nodes = listnodes.call(datasourceDefinition, params);
	var result = {
		nodes : nodes, 
		count : nodes.length
	};
	NodeSearch.PagingHelper.slice(result, 1, -1);
	return result;
}


// AGGREGATION DEFINITIONS

function buildAggregateData(datasourceDefinition, params) {
	
	// Check whether params contain a formData definition, which is not a legal operation on aggregation
	if (undefined !== params.query || undefined !== params.term) {
		throw new Error('UnsupportedOperationException! The aggregation operation does not support the query or term parameters');
	}
		
	var result = buildAggregateNodeList(datasourceDefinition, params);
	var aggregator = new Aggregator(datasourceDefinition);
	var dataList = aggregator.evaluateList(result.nodes);
	
	result = {
		count : dataList.length,
		items : dataList
	}
	postProcessAggregate(result, datasourceDefinition, params);
	
	return result;
	
}

function buildAggregateNodeList(datasourceDefinition, params) {
	
	var searchAdditional = datasourceDefinition.getSearchAdditional();
	var delegatedDatasource = datasourceDefinition.getDelegated();
	
	var groupBy = searchAdditional.groupBy;
	var delegatedParams = {
			
		datasourceId : delegatedDatasource.getDatasourceId(), // no matter
		startIndex : 0,
		maxItems : -1,
		sort : [
			{
				column : groupBy,
				dir : 'ASC'
			}
		],
		filters : params.filters // forward filters
		
	}
	
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
	
	// Get datasource-definition
	var 
		datasourceId = params.datasourceId,
		datasourceDefinition = DatasourceDefinitions.getDefinition(datasourceId)
	;
	if (null == datasourceDefinition) {
		var 
			datasourceIds = DatasourceDefinitions.getDatasourceIds(),
			definedDatasources = Utils.String.join(datasourceIds, ','),
			mesg = "The provided datasourceId '" + datasourceId + "' cannot be found. Here are the datasources defined: " + definedDatasources
		;
		status.setCode(status.STATUS_NOT_FOUND, mesg);
		return;
	}

	var 
		searchType = datasourceDefinition.getSearchType(),
		isAggregate = ('aggregate' === searchType),
		data = isAggregate
			? buildAggregateData(datasourceDefinition, params)
			: buildData(datasourceDefinition, params)
	; 
	
	model.data = data;
	if ('csv' == params.format) {
		model.fields = DatasourceDefinitions.getFlatColumns(datasourceId);
	}

}
