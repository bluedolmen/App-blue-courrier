Ext.define('Yamma.utils.SignatureUtils', {
	
	singleton : true,
	
	WS_PDF_INFORMATION_URL : 'alfresco://bluedolmen/digital-signing/pdf-information?nodeRef={nodeRef}',
	
	UNITS_PER_MILLIMETERS : 72 / 25.4,
	
	isFeatureAvailable : function() {
		
		if ('undefined' == typeof DigitalSigningConfig) return false;
		return true === DigitalSigningConfig.active;
		
	},
	
	unitsToMillimeters : function(units) {
		return units / Yamma.utils.SignatureUtils.UNITS_PER_MILLIMETERS;
	},
	
	millimetersToUnits : function(millimeters) {
		return millimeters * Yamma.utils.SignatureUtils.UNITS_PER_MILLIMETERS;
	},
	
	/**
	 * precision to 0.5mm
	 */
	pixelsToMillimeters : function(pixels, pixelsPerUnit) {
		return Ext.util.Format.round(
				Yamma.utils.SignatureUtils.unitsToMillimeters(
						2. * (1. * pixels / pixelsPerUnit) /* [units] */
				)
				, 0
		) / 2.;
	},
	
	millimetersToPixels : function(millimeters, pixelsPerUnit) {
		
		return Yamma.utils.SignatureUtils.millimetersToUnits(millimeters) * pixelsPerUnit; 
		
	},
	
	loadPageInformation : function(nodeRef, pageNumber, onSuccess, finally_) {
		
		var 
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				me.WS_PDF_INFORMATION_URL.replace(/\{nodeRef\}/, nodeRef)
			)
		;
		
		if (pageNumber) {
			url += '&pageNumber={pageNumber}'.replace(/\{pageNumber\}/, pageNumber);
		}
			
		Bluedolmen.Alfresco.jsonRequest({
			
			url : url,
			
			onSuccess : function onSuccess_(pageInformation) {
				
				if (null == pageInformation) return;
				if (!pageInformation) return;
				
				if (onSuccess) onSuccess(pageInformation);
				if (finally_) finally_();
				
			},
			
			onFailure : function onFailure() {
				Bluedolmen.Alfresco.genericFailureManager.apply(this, arguments);
				if (finally_) finally_();
			}
			
		});
		
		
	}
	
});