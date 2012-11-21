(function() {
	
	var Helpers = Utils.ns('Datasource.Helpers');
	
	Helpers.getPersonDescription = function(userName) {
			
		return {			
			username : userName,
			displayName : Utils.Alfresco.getDisplayName(userName),
			avatarUrl : Utils.Alfresco.getPersonAvatarUrl(userName)
		};
		
	};
	
})();