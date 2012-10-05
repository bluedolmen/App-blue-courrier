///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/inmail-utils.js">

(function() {
	
	var 
		childAssoc = behaviour.args[0],
		isNew = behaviour.args[1],
		tray = childAssoc.getParent(),
		document = childAssoc.getChild()
	;	
	
	if (
			/* The document is not available */
			('undefined' == typeof document) ||
			
			/* The document was only moved and not created */
			!isNew ||
			
			/* The document is not a content document */
			!document.isSubType('cm:content') ||
			
			/* The tray is not an inbox */
			!TraysUtils.isInboxTray(tray)
	) {
		return;
	}	
	
	logNewDocument();
	IncomingMailUtils.createMail(document);
	
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
	
})();
