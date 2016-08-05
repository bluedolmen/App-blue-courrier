///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {
	
	if (!Utils.Alfresco.isAuthenticated()) return; // not authenticated
	
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
	
	if ('undefined' == typeof document || null == document) {
		logger.warn('[onCreateImapFolderContent] Cannot find any contextual document. Ignoring...');
		return;
	}
	
	if (!document.exists() || !document.hasPermission('Read')) {
		logger.debug('[onCreateImapFolderContent] Ignoring unreadable document ' + document.nodeRef);
		return; // may arrive with temporary files
	}
	
	if (!document.hasAspect('imap:imapContent')) { // Only consider imap-content
		return;
	}	

	var serviceName = getTargetServiceName();
	if (!serviceName) return;
	
	var targetTray = TraysUtils.getInboxTray(serviceName);
	if (null == targetTray) {
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
		
		var parent = document.parent;
		if (null == parent || !parent.hasPermission('Read')) return null;
		
		var siteName = parent.name;
		
		return siteService.getSite(siteName) ? siteName : null;
		
	}
	
	
	
})();
