///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var
		siteName = null
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var parseArgs = new ParseArgs('serviceName');
		
		siteName = Utils.asString(parseArgs['serviceName']);
		
		if (!siteName) {
			throw {
				code : 400,
				message : "The site-name (siteName) value has to be defined" 
			}			
		}
		
		var siteNode = Utils.Alfresco.getSiteNode(siteName);
		if (null == siteNode) {
			throw {
				code : 400,
				message : "The site-name '" + siteName + "' does not exist" 
			}			
		}
		
		main();
		
	});
	
	function main() {
		
		if (ServicesUtils.isService(siteName)) {
			ServicesUtils.unsetAsService(siteName);
		}
		
		status.setCode(status.STATUS_NO_CONTENT, 'Pas de contenu');
		
	}	
	
})();