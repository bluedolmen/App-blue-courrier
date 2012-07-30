(function() {   
	
	var Logger = Alfresco.logger;
	var JSON = YAHOO.lang.JSON;

	
	if ('undefined' == typeof Bluexml) Bluexml = {};
	
	Bluexml.Socket = function() {

		setActionChannel();
	
		function setActionChannel() {
			
			document.onformaction = new YAHOO.util.CustomEvent(
				'formAction', /* type */
				this, /* context */
				true, /* silent */
				YAHOO.util.CustomEvent.LIST, /* signature */
				true /* fireOnce */
			);
			
		}
		
	};

	Bluexml.Socket.prototype.postMessage = function(data) {
		
		try {
			
			var parentWindow = window.parent;
			
			if (!parentWindow.postMessage) {
				Logger.error('Cannot post message on button clicked. Iframe-based form-integration will not work as expected');
				return;
			}
			
		} catch (e) {
			
			Logger.error('Cannot access to the parent window. Iframe-based form-integration will not work as expected');
			return;
			
		}
		
		data = isIE() ? stringify(data) : data;
		
		parentWindow.postMessage(data, '*');
		
	};
	
	// SINGLETON INSTANCE
	Bluexml.Socket.Default = new Bluexml.Socket();

	
	
	/**
	 * @private
	 */
	function stringify(data) {
		
		if (!JSON) {
			Logger.error('Cannot stringify to JSON the provided data. Problems may occur');
			return data;
		}
		
		return JSON.stringify(data);
	}
	
	/**
	 * @private
	 */
	function isIE () {
		
		var userAgent = navigator.userAgent;
		if (!userAgent) {
			Logger.warn('Cannot get navigator user-agent. Considered as not IE!')
			return false;
		}
		
		return (-1 != userAgent.indexOf('MSIE'));
		
	}
	
})();