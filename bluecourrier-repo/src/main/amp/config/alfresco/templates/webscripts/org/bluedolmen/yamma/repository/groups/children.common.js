function checkAuthorized() {
	var
		urlElements = url.extension.split("/"),
	   	shortName = urlElements[0],
	   	fullAuthorityName = urlElements[2],
	   	message
	;
	
	// We only manage Service groups currently
	if (!shortName.match(".*Service.*")) {
		message = "The group '" + shortName + "' is not a service-group and cannot be managed by you." 
		status.setCode(status.STATUS_FORBIDDEN, message);
		throw new Error(message);
	}
}

checkAuthorized();
