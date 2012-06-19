function main() {
	// Check mandatory parameters
	var nodeRef = args.nodeRef;
	if (nodeRef == null || nodeRef.length == 0) {
		status.code = 400;
		status.message = "Parameter 'nodeRef' is missing.";
		status.redirect = true;
	}

	var contentUrl = "/api/node/content/" + nodeRef.replace(/:\//,'');
	var downloadUrl = contentUrl + '?a=true';
	
	// Call repo for node's metadata
	var json = remote.call("/api/metadata?nodeRef=" + nodeRef);
	if (json != null && json.toString().trim().length() > 2) {
		
		var node = eval('(' + json + ')'),
			mcns = "{http://www.alfresco.org/model/content/1.0}"; 

		var fileName = node.properties[mcns + "name"];
		var encodedFileName = stringUtils.urlEncode(fileName);
		downloadUrl = contentUrl + '/' + encodedFileName + '?a=true';
	}
	
	model.contentUrl = contentUrl;
	model.downloadUrl = downloadUrl;

}

// Start the webscript
main();