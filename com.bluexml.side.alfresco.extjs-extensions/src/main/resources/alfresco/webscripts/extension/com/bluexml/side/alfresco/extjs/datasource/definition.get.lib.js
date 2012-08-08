<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/common.lib.js">
<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/datasource/definitions.lib.js">

function main() {
	
	var datasourceId = url.templateArgs.datasourceId;
	if (null == datasourceId) {
		var message = "The 'datasourceId' argument has to be provided";
		status = status.setCode(status.STATUS_BAD_REQUEST, message);
		return;
	}
	
	var datasourceDefinition = DatasourceDefinitions.getDefinition(datasourceId);
	if (datasourceDefinition == null) {
		// bad status has been set just before
		return;
	}

	model.datasourceId = datasourceId;
	// globals for mergeFields
	model.fields = []; 
	
	var idProperties = [];
	var fields = datasourceDefinition.getFields();
	mergeFields(fields);
	if (idProperties.length > 0) {
		model.idProperty = idProperties[0];
	}
	
	
	function mergeFields(fields) {
		
		Utils.forEach(fields,
			function(field) {
				if ('composite' === field.getType()) {
					mergeFields(field.getFields());
				} else {
					
					model.fields.push(
						{
							name : field.getName(),
							label : field.getLabel(),
							description : field.getDescription(),
							datatype : field.getType()
						}
					);
					
					if (field.isId()) {
						idProperties.push(field.getName());
					}
				}
			}
		);
		
	}

};
