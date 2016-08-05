function main() {
	
	var 
//		pageId = url.templateArgs['pageId'],
//		uri = '/bluedolmen/yamma/acs' + (null != pageId ? '/' + pageId : ''),
		uri = '/bluedolmen/acs/' + args['source-id'],
		connector = remote.connect("alfresco"),
		result = connector.get(encodeURI(uri))
	;
	
	if (result.status.code != status.STATUS_OK) {
		status.code = result.status.code;
		status.message = msg.get("message.failure");
		status.redirect = true;
		return;
	}
		
	var acs = eval("(" + result.response + ")");
	if (!acs.width && args.width) {
		acs.width = args.width;
	}
	if (!acs.height && args.height) {
		acs.height = args.height;
	}
	if (!acs.url && args.source) {
		acs.url = args.source;
	}
	
	return acs;
   
}

model.acs = main();

