function main() {
	
	var 
		appname = args['app-name'],
		configname = args['config-name'],
		uri = '/bluedolmen/app-config/' + appname + '/' + configname,
		connector = remote.connect("alfresco"),
		result = connector.get(encodeURI(uri))
	;
	
	if (result.status.code != status.STATUS_OK) {
		return {};
	}
		
	var config = eval("(" + result.response + ")");
	
	return jsonUtils.toJSONString(config);
   
}

model.config = main();

