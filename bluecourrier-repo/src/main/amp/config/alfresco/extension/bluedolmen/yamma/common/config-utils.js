(function() {	

	ConfigUtils = Utils.ns('Utils.Alfresco.Config');
	
	ConfigUtils.getConfigValue = function(configId, defaultValue, postProcessing) {
		
		var value = bluecourrierConfig.getValue(configId);
		if (null == value && undefined !== defaultValue) {
			return defaultValue;
		}
		
		if (undefined !== postProcessing) {
			
			if (Utils.isString(postProcessing) && undefined !== ConfigUtils.transformFunctions[postProcessing]) {
				value = ConfigUtils.transformFunctions[postProcessing](value);
			}
			
			if (Utils.isFunction(postProcessing)) {
				value = postProcessing(value);
			}
			
		}
		
		return value;
		
	};
		
	ConfigUtils.interpretAsBoolean = function(value) {
			
		if (null == value) return false;
		return 'true' == Utils.asString(value).toLowerCase();
		
	};
	
	ConfigUtils.interpretAsString = function(value) {
		return Utils.asString(value);
	};
	
	ConfigUtils.interpretAsLowerCaseString = function(value) {
		return Utils.asString(value).toLowerCase();
	};
	
	ConfigUtils.transformFunctions = {
		'boolean' : ConfigUtils.interpretAsBoolean,
		'string' : ConfigUtils.interpredAsString
	}

})();
