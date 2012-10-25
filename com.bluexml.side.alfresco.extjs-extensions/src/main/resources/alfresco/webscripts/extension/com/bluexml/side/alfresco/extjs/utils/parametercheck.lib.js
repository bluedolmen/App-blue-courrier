(function() {
	
	ParameterCheck = {};
	
	ParameterCheck.mandatoryParameter = function(value, parameterName) {
		
		var message = "The parameter '" + parameterName + "' is mandatory."
		return this.mandatory(value, message);
		
	}
	
	ParameterCheck.mandatory = function(value, errorMessage) {
		
		if (null == value) {
			throw new Error(errorMessage);
		}
		return value;
		
	}
	
	ParameterCheck.nonEmptyString = function(value, errorMessage, parameterName) {
		
		errorMessage = errorMessage || 'The provided value ' + (parameterName ? "for parameter '" + parameterName + "' " : "") + 'has to be a valid non-empty String';
		if (null == value || '' === value) {
			throw new Error(errorMessage);
		}
		return value;
		
	}
	
	
})();