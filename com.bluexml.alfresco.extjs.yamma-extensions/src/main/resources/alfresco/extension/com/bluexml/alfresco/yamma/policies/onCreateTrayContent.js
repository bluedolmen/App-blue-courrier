///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	var childAssoc = behaviour.args[0];
	var document = childAssoc.getChild();	
	
	if ('undefined' == typeof document) {
		logger.warn('[onCreateTrayContent] Cannot find any contextual document.');
		return;
	}

	// Filters on yamma-ee:Tray children
	if (!checkParentType()) return;
	
	main();
	
	
	
	function main() {
		logNewDocument();
		specializeDocumentType();
		initializeDates();
	}

	function logNewDocument() {
		if (!logger.isLoggingEnabled()) return;

		var documentName = document.name;

		var tray = TraysUtils.getTray(document);
		if (!tray) return;
		var trayName = tray.name;

		var message = 
			"A new document '" + documentName + "' " +
			"arrived in the tray '" + trayName + "'. ";
			//"of site '" + siteName + "'";
		logger.log(message);
	}

	function specializeDocumentType() {
		document.specializeType(YammaModel.MAIL_TYPE_SHORTNAME);
	}

	function initializeDates() {
		var NOW = new Date();
		document.properties[YammaModel.MAIL_STAMP_DATE_PROPNAME] = NOW;
		document.properties[YammaModel.MAIL_DELIVERY_DATE_PROPNAME] = NOW;
		document.properties[YammaModel.MAIL_WRITING_DATE_PROPNAME] = NOW;
		document.save();
	}
	
	function checkParentType() {
		var parent = document.parent;
		if (!parent) {
			logger.warn('[onCreateTrayContent] Cannot get the parent of the new created node.');
			return false;
		}
		return (parent.typeShort && YammaModel.TRAY_TYPE_SHORTNAME == parent.typeShort);
	}	
	
})();
