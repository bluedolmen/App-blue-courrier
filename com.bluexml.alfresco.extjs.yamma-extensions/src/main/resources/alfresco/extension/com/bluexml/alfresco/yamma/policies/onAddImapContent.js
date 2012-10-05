///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/imap-mail-utils.js">

(function() {
	
	var isNew = true;

	if ("undefined" != typeof behaviour) {
		isNew = Utils.asString(behaviour.args[1]) === 'true';
		var childAssociation = behaviour.args[0];
		if (!childAssociation) {
			logger.warn('[onAddImapContent] Cannot find the child-association definition, ignoring behaviour...');
			return;
		}
		
		document = childAssociation.child; // in policy (else supposed called as a rule)
	}
	
	if (!isNew) return; // Do not manage a document move
	
	if ('undefined' == typeof document) {
		logger.warn('[onAddImapContent] Cannot find any contextual document.');
		return;
	}
	
	if (!document.hasAspect('imap:imapContent')) {
		return;
	}	

	var serviceName = getTargetServiceName();
	if (!serviceName) return;
	
	ImapMailUtils.mapToServiceTray(document, serviceName);

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
		
		return targetSite ? siteName : null;
	}
	
	
	
})();
