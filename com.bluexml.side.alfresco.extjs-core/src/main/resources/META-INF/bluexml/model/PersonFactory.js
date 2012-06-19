/**
 * This factory object enables to retrieve a person from the provided username.
 * It caches the entry in order to efficiently retrieve the user when called
 * multiple times.
 * <p>
 * However this implementation has to be improved, since the asynchronous nature
 * of the method leads to several calls to the Alfresco server when multiple
 * calls are to close. We would need to manage the concurrency, but this
 * optimization is out of the scope of the current implementation and needs a
 * more elaborated code.
 */
Ext.define('Bluexml.model.PersonFactory', {

 	requires : [
 		'Bluexml.model.Person'
 	],
 	
 	singleton : true,
	personCache : {},
	
	getPerson : function(userName, onPersonAvailable) {
		
		var me = this;
		
		var person = me.personCache[userName];
		if (person) {
			applyCallback(person);
			return;
		}
		
		var Person = Ext.ModelManager.getModel('Bluexml.model.Person');
		Person.load(
			/* id */
			userName,
			
			/* config */
			{
				success : function(person) {
					if (!me.personCache[userName]) me.personCache[userName] = person; // add to cache
					applyCallback(person);
				}
			}
		);
		
		function applyCallback(person) {
			if (onPersonAvailable) onPersonAvailable(person);
		}
		
	}
	
});