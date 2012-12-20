(function() {

	Init.InitDefinition.BySite.Yamma = Utils.Object.create(Init.InitDefinition.BySite, {
				
		getSiteList : function() {
			return ServicesUtils.getManagedServices();
		}
		
	});

})();
