///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/inmail-utils.js">

(function() {
	
	var 
		childAssoc = behaviour.args[0],
		isNew = behaviour.args[1],
		tray = childAssoc.getParent(),
		trayName = tray.name,
		document = childAssoc.getChild(),
		documentName = document.name
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
	
	main();
	
	
	
	
	
	
	function main() {
		
		logNewDocument();
				
		UploadUtils.extractMetadata(document);
		
		var doManagedReply = IncomingMailUtils.manageReplyDocument(document);
		if (true === doManagedReply) return; 
		
		IncomingMailUtils.createMail(document);
		
	}
	
	
	function logNewDocument() {
		if (!logger.isLoggingEnabled()) return;

		var 
			message = 
				"A new document '" + documentName + "' " +
				"arrived in the tray '" + trayName + "'. "
		;
		
		logger.log(message);
	}	
	
})();
