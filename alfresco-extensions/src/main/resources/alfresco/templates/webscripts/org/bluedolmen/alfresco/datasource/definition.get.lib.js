<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">
<import resource="classpath:/alfresco/extension/bluedolmen/utils/common.lib.js">
<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/datasource/definitions.lib.js">

function main() {
	
	var datasourceId = url.templateArgs.datasourceId;
	if (null == datasourceId) {
		var message = "The 'datasourceId' argument has to be provided";
		status = status.setCode(status.STATUS_BAD_REQUEST, message);
		return;
	}
	
	var datasourceDefinition = DatasourceDefinitions.getDefinition(datasourceId);
	if (null == datasourceDefinition) {
		var 
			datasourceIds = DatasourceDefinitions.getDatasourceIds(),
			definedDatasources = Utils.String.join(datasourceIds, ','),
			mesg = "The provided datasourceId '" + datasourceId + "' cannot be found. Here are the datasources defined: " + definedDatasources
		;
		status.setCode(status.STATUS_NOT_FOUND, mesg);
		return;
	}

	model.datasourceId = datasourceId;
	// globals for mergeFields
	model.fields = datasourceDefinition.getFlatColumns();
	model.idProperty = datasourceDefinition.getIdProperties()[0] || '';

};
