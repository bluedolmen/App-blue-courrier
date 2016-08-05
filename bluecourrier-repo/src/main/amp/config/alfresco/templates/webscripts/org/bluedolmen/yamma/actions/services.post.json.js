///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var
		siteName = null,
		parentServiceName = null,
		canSign = false		
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs('siteName', 'parentName', 'canSign'),
			canSignValue = Utils.asString(parseArgs['canSign'])
		;
		
		siteName = Utils.asString(parseArgs['siteName']);
		parentServiceName = Utils.asString(parseArgs['parentName']) || null;
		canSign = ('true' == canSignValue || 'false' == canSignValue) ? 'true' === canSignValue : null;
		
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
		
		model.serviceNodeRef = siteNode;
		
		main();
		
	});
	
	function main() {
		
		if (!ServicesUtils.isService(siteName)) {
			ServicesUtils.setAsService(siteName);
		}		
		
		if (parentServiceName) {
			ServicesUtils.setParentService(siteName, parentServiceName, true /* override */);
		}
		
		if (null !== canSign) {
			ServicesUtils.setSignable(siteName, canSign);
		}
		
	}	
	
})();