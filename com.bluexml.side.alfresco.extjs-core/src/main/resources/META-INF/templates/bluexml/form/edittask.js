(function() {

	if (document) {
		document.onformaction = new YAHOO.util.CustomEvent(
			'formAction', /* type */
			this, /* context */
			true, /* silent */
			YAHOO.util.CustomEvent.LIST, /* signature */
			false /* fireOnce */
		);
	}	
	
	YAHOO.Bubbling.on('beforeFormRuntimeInit', function(eventName, args) {
		
		var formsRuntime = args[1].runtime;
		formsRuntime.setAJAXSubmit(true, 
		
			{
				successCallback : {
					fn : onJsonPostSuccess,
					scope : this
				},
				
				failureCallback : {
					fn : onJsonPostFailure,
					scope : this
				}
			}
			
		);
		/*
		formsRuntime.doBeforeAjaxRequest = 
			{
				fn : function(form, obj) {
					var onformaction = getFormAction();
					onformaction.fire('submit', form);
					
					return true;
				},
				obj : null,
				scope : this
			};
		*/
	});
	
	function getFormAction() {
		var onformaction = document.onformaction;
		if (!onformaction) {
			throw new Error('IllegalStateException! Cannot find the onformaction CustomEvent necessary to provide the expected functionnality');
		}
		return onformaction;
	}
	
	function onJsonPostFailure(response) {
		
		var errorMessage = 'Erreur durant la gestion de la tâche de workflow';
		
		if (response.json && response.json.message) {
			errorMessage = response.json.message;
		}

		var onformaction = getFormAction();
		onformaction.fire('error', errorMessage);
	}

	function onJsonPostSuccess(response) {
		
		var jsonTextResponse = response.serverResponse.responseText;
		if (!jsonTextResponse) return;
		
		try {
			var jsonResponse = YAHOO.lang.JSON.parse(jsonTextResponse);
		} catch (e) {
			console.log('Cannot parse the json response');
			return;
		}
		
		var onformaction = getFormAction();
		onformaction.fire('success', jsonResponse);
	}
	
})();

