///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/inmail-utils.js">

(function() {
	
	var 
		childAssoc = behaviour.args[0],
		tray = childAssoc.getParent(),
		document = childAssoc.getChild()
	;	
	
	if ('undefined' == typeof document) {
		logger.warn('[onCreateTrayContent] Cannot find any contextual document.');
		return;
	}
	
	// Filters on yamma-ee:Tray children
	if (!checkParentType()) return;
	if (!TraysUtils.isInboxTray(tray)) return; // Only transform documents of inbox trays
	
	main();
	
	
	function main() {
		logNewDocument();
		IncomingMailUtils.createMail(document);
	}

	function logNewDocument() {
		if (!logger.isLoggingEnabled()) return;

		var 
			documentName = document.name,
			trayName = tray.name,
			message = 
				"A new document '" + documentName + "' " +
				"arrived in the tray '" + trayName + "'. "
		;
		
		logger.log(message);
	}
	
	function checkParentType() {
		if (!tray) {
			logger.warn('[onCreateTrayContent] Cannot get the parent of the new created node.');
			return false;
		}
		
		return tray.isSubType(YammaModel.TRAY_TYPE_SHORTNAME);
	}	
	
})();
