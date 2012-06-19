///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/policies/onCreateSite.js">

(function() {
	
	if (!document) {
		logger.warn('[onCreateSite] Cannot find any contextual document.');
		return;
	}
	if (!document.typeShort || 'st:site' != document.typeShort) {
		logger.warn('[onCreateSite] The contextual document is not of type st:site as expected');
		return;
	}
	var siteNode = document;
	
	main();
	
	function main() {
		TraysUtils.createSiteTrays(siteNode);
	}
	
})();
