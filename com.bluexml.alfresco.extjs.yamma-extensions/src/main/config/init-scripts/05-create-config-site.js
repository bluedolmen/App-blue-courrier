///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

(function() {

	main();
	
	function main() {
		
		var configSite = YammaUtils.getOrCreateConfigSite();
		if (!configSite) {
			logger.error('Cannot create the configuration site!');
		}
	
	};
	
})();