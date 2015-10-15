///<import resource="classpath:${config.target.path}/init-scripts/init-common.js">
(function() {

	var PeopleContacts = Utils.Object.create(Init.InitDefinition, {
		
		id : 'people-contacts',
		
		init : function() {

			DirectoryUtils.synchronizeContacts();
			
		},
		
		clear : function() {
			
			var definedContacts = DirectoryUtils.getDefinedContacts();
			
			Utils.forEach(definedContacts, function(contactNode) {
				contactNode.remove();
			});
			
		},
		
		checkInstalled : function() {
			
			var undefinedPeople = DirectoryUtils.getUndefinedPeople();
			if (0 == undefinedPeople.length) return Init.InstallationStates.FULL;
			
			var definedContacts = DirectoryUtils.getDefinedContacts();
			if (0 == definedContacts.length) return Init.InstallationStates.NO;

			return Init.InstallationStates.PARTIALLY;
			
		},
		
		getDetails : function() {

			var undefinedPeople = DirectoryUtils.getUndefinedPeople();
			return undefinedPeople.length + ' contacts non synchronisés';
			
		}		
		
	});
	
	init.definition = PeopleContacts;
	
})();