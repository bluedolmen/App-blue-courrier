function main() {
	
	var 
		appname = args['app-name'],
		uri = '/bluedolmen/license/' + appname,
		connector = remote.connect("alfresco"),
		result = connector.get(encodeURI(uri)),
		config, isValid
	;
	
	if (result.status.code != status.STATUS_OK) {
		return;
	}
		
	config = eval("(" + result.response + ")");
	
	isValid = !!config.isValid;
	
	if (config.license) {
		config = config.license;
		config.isValid = isValid;
	}
	
	return jsonUtils.toJSONString(config);

}

model.license = main();
