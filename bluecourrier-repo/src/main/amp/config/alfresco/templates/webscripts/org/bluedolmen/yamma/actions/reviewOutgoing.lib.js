function checkActorsChain(actorsChain) {
	
	if (null == actorsChain) return;
	actorsChain = Utils.String.splitToTrimmedStringArray(Utils.asString(actorsChain));
	
	var message = null;
	
	Utils.forEach(actorsChain, function(actor) {
		
		if (null != people.getPerson(actor)) return;
		message = "Actor '" + actor + "' is not a valid Alfresco user for the validation chain";
		
	});
	
	return message;
	
}

function checkSigningActor(actor) {
	
	if (!actor) return;
	
	if (null == people.getPerson(actor)) {
		return "Actor '" + actor + "' is not a valid Alfresco username";
	}
	
}
