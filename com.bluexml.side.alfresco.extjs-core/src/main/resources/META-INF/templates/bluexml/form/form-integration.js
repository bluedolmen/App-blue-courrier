(function() {
	
	var JSON = YAHOO.lang.JSON;
	
	var formIntegration = null;
	
	/*
	 * MAIN
	 */
	
	init();
	
	
	function init() {
		YAHOO.Bubbling.on("formContentReady", onFormContentReady, this);
	}
		
	function onFormContentReady(layer, args) {
		var formUI = args[1];
		/*
		 * Only register the behaviour for the first level form.
		 * This simple method can only work if we get 1 Iframe = 1 Form lifecycle
		 */ 
		if (formIntegration) return; 
		
		formIntegration = new Bluexml.FormIntegration(formUI);
	};	

	
	
	/*
	 * FORM INTEGRATION OBJECT DEFINITION
	 */
	
	if ('undefined' == typeof Bluexml) Bluexml = {};
	
	Bluexml.FormIntegration = function(formUI) {

		var me = this;
		
		if ('undefined' == typeof formUI || !formUI) {
			throw new Error('IllegalArgumentException! The provided formUI is not valid');
		}
		
		this.formUI = formUI;
		this.socket = Bluexml.Socket.Default;
				
		(function registerButtonClickEvents() {
			
			var formButtons = me.formUI.buttons;
			if (!formButtons) return;
			
			for (buttonId in formButtons) {
				
				var button = formButtons[buttonId];
				button.addListener("click", me.onButtonClick, buttonId, me);
				
			}
			
		})();
		
		YAHOO.Bubbling.on('beforeFormRuntimeInit', beforeFormRuntimeInit, this);
		function beforeFormRuntimeInit(eventName, args) {
			
			var formsRuntime = args[1].runtime;
			if (!formsRuntime || !formsRuntime.ajaxSubmit) return; // not an ajax-submit

			formsRuntime.setAJAXSubmit(true, 
			
				{
					successCallback : {
						fn : me.onJsonPostSuccess,
						scope : me
					},
					
					failureCallback : {
						fn : me.onJsonPostFailure,
						scope : me
					}
				}
				
			);
			
		}
		
		
	};
	
	Bluexml.FormIntegration.prototype.onButtonClick = function(event, buttonId) {

		this.socket.postMessage({
			eventType : 'button-click',
			buttonId : buttonId
		});
		
	};
	
	Bluexml.FormIntegration.prototype.onJsonPostSuccess = function(response) {
		
		var jsonTextResponse = response.serverResponse.responseText;
		if (!jsonTextResponse) return;
		
		try {
			var jsonResponse = JSON.parse(jsonTextResponse);
		} catch (e) {
			Alfresco.logger.error('Cannot parse the json response');
			return;
		}
		
		this.socket.postMessage({
			eventType : 'form-result',
			state : 'success',
			message : '',
			data : jsonResponse
		});
		
	};
	
	Bluexml.FormIntegration.prototype.onJsonPostFailure = function(response) {
		
		var errorMessage = 'Error';
		
		if (response.json && response.json.message) {
			errorMessage = response.json.message;
		}

		this.socket.postMessage({
			eventType : 'form-result',
			state : 'failure',
			message : errorMessage
		});		
		
	};
	

	
})();

