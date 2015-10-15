///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/inmail-utils.js">

(function() {
	
	// This script has to be executed as an admin since some managers may allow a copy to 
	// a service where they are not allowed to read content.
	
	main();
	
	function main() {
		
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
				
		UploadUtils.extractMetadata(document);
		
		var doManagedReply = IncomingMailUtils.manageReplyDocument(document);
		if (true === doManagedReply) return; 
		
		IncomingMailUtils.createMail(document);
		
		
		
		
		function logNewDocument() {
			if (!logger.isLoggingEnabled()) return;

			var 
			
				trayName = tray.name,
				documentName = document.name,
				message = 
					"A new document '" + documentName + "' " +
					"arrived in the tray '" + trayName + "'. "
			;
			
			logger.log(message);
		}
		
		
	}
	
	
	
})();
