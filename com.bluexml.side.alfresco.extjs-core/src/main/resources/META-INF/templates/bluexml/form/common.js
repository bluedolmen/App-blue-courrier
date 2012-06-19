(function() {
	
	// Defines a global custom event for form-actions retrieving on document
	if (document) {
		document.onformaction = new YAHOO.util.CustomEvent(
			'formAction', /* type */
			this, /* context */
			true, /* silent */
			YAHOO.util.CustomEvent.LIST, /* signature */
			true /* fireOnce */
		);
	}
	
})();

