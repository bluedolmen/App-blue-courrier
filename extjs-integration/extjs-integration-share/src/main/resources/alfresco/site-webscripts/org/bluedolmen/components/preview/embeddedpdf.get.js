function main() {
	// Check mandatory parameters
	var nodeRef = args.nodeRef;
	if (nodeRef == null || nodeRef.length == 0) {
		status.code = 400;
		status.message = "Parameter 'nodeRef' is missing.";
		status.redirect = true;
		return;
	}

	var 
		contentUrl = "/api/node/content/" + nodeRef.replace(/:\//,''),
		downloadUrl = contentUrl + '?a=true',
		json = remote.call("/api/metadata?nodeRef=" + nodeRef);
	;
	
	// Call repo for node's metadata
	if (json != null && json.toString().trim().length() > 2) {
		
		var 
			node = eval('(' + json + ')'),
			nameProperty = "{http://www.alfresco.org/model/content/1.0}name",
			fileName = node.properties[nameProperty],
			encodedFileName = stringUtils.urlEncode(fileName)
		; 

		downloadUrl = contentUrl + '/' + encodedFileName + '?a=true';
		model.fileName = fileName;
	}
	
	model.contentUrl = contentUrl;
	model.downloadUrl = downloadUrl;

}

// Start the webscript
main();