///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/init/init-utils.lib.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/directory-utils.js">

(function() {

	Init.InitDefinition.BySite.Yamma = Utils.Object.create(Init.InitDefinition.BySite, {
				
		getSiteList : function() {
			return ServicesUtils.getManagedServices();
		}
		
	});

})();
