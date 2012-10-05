///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {
	
	var isNew = true;

	// This script may be used either by a behaviour or by a rule
	if ("undefined" != typeof behaviour) {
		isNew = Utils.asString(behaviour.args[1]) === 'true';
		var childAssociation = behaviour.args[0];
		if (!childAssociation) {
			logger.warn('[onCreateImapFolderContent] Cannot find the child-association definition, ignoring behaviour...');
			return;
		}
		
		document = childAssociation.child; // in policy (else supposed called as a rule)
	}
	
	if (!isNew) return; // Do not manage a document move
	
	if ('undefined' == typeof document) {
		logger.warn('[onCreateImapFolderContent] Cannot find any contextual document. Ignoring...');
		return;
	}
	
	if (!document.hasAspect('imap:imapContent')) { // Only consider imap-content
		return;
	}	

	var serviceName = getTargetServiceName();
	if (!serviceName) return;
	
	var targetTray = TraysUtils.getSiteTray(serviceName, TraysUtils.INBOX_TRAY_NAME);
	if (!targetTray) {
		logger.warn("[onCreateImapFolderContent] Cannot find the inbox of the service '" + serviceName + "'");
		return;
	}
	
	document.move(targetTray);

	/**
	 * Get the target service name
	 * 
	 * This implementation checks the parent name to get a potential site
	 * name
	 * 
	 */
	function getTargetServiceName() {
		var 
			parent = document.parent,
			siteName = parent.name,
			targetSite = siteService.getSite(siteName)
		;
		
		return targetSite ? Utils.asString(siteName) : null;
	}
	
	
	
})();
