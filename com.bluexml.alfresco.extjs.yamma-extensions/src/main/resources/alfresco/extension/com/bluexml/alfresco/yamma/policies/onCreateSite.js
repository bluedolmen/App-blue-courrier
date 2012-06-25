///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-utils.js">

(function() {

	var childAssoc = behaviour.args[0];
	var node = childAssoc.getChild();	
	
	if ('undefined' == typeof node) {
		logger.warn('[onCreateSite] Cannot find any contextual document.');
		return;
	}
	
	if (!node.typeShort || 'st:site' != node.typeShort) {
		logger.warn('[onCreateSite] The contextual document is not of type st:site as expected');
		return;
	}
	var siteNode = node;
	
	main();
	
	function main() {
		createSiteTrays();
	}
	
	function createSiteTrays() {
		TraysUtils.createSiteTrays(siteNode);
	}
	
})();
