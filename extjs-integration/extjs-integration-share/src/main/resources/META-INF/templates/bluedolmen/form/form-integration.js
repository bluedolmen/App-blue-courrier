(function() {
	
	var 
		JSON = YAHOO.lang.JSON,
		formIntegration = null
	;
	
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
		
		formIntegration = new Bluedolmen.FormIntegration(formUI);
	};	
	
	function getElementsByClassName(className) {
		if (document.getElementsByClassName) { 
  			return document.getElementsByClassName(className); }
		else { 
			return document.querySelectorAll('.' + className); 
		} 
	}
	
	/*
	 * FORM INTEGRATION OBJECT DEFINITION
	 */
	
	if ('undefined' == typeof Bluedolmen) Bluedolmen = {};
	
	Bluedolmen.FormIntegration = function(formUI) {

		var me = this;
		
		if ('undefined' == typeof formUI || !formUI) {
			throw new Error('IllegalArgumentException! The provided formUI is not valid');
		}
		
		this.formUI = formUI;
		this.socket = Bluedolmen.Socket.Default;
		
		registerButtonClickEvents();
		notifiyFormSize();
				
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
		
		function registerButtonClickEvents() {
			
			var 
				formButtons = me.formUI.buttons,
				button = null
			;
			if (!formButtons) return;
			
			for (var buttonId in formButtons) {
				button = formButtons[buttonId];
				button.addListener("click", me.onButtonClick, buttonId, me);
			}
			
		}		
		
		function notifiyFormSize() {
			var
				matchingElements = getElementsByClassName('share-form'),
				matchingElement = matchingElements[0]
			;
			if (!matchingElement) return;
			
			me.socket.postMessage({
				eventType : 'form-size',
				width : matchingElement.offsetWidth,
				height : matchingElement.offsetHeight
			});
			
		}
		
		
		
	};
	
	Bluedolmen.FormIntegration.prototype.onButtonClick = function(event, buttonId) {

		this.socket.postMessage({
			eventType : 'button-click',
			buttonId : buttonId
		});
		
	};
	
	Bluedolmen.FormIntegration.prototype.onJsonPostSuccess = function(response) {
		
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
	
	Bluedolmen.FormIntegration.prototype.onJsonPostFailure = function(response) {
		
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

