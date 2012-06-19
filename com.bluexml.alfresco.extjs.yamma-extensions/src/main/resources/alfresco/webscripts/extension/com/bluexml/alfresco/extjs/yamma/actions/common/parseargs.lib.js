(function() {
	
	ParseArgs = function() {
		
		var me = this;
		var argumentDefs = arguments;
		
		parseargs();
		
		function parseargs() {
			for (var j = 0, jlen = argumentDefs.length; j < jlen; j++) {
				var argumentDef = argumentDefs[j];
				if (!argumentDef) continue;
				
				var argumentName = 'string' == typeof argumentDef
					? argumentDef
					: argumentDef.name;
					
				var mandatory = 'string' == typeof argumentDef
					? false
					: argumentDef.mandatory;
					
				var defaultValue = 'string' == typeof argumentDef
					? null
					: argumentDef.defaultValue;
				
				var checkValue = ('string' == typeof argumentDef) || (!argumentDef.checkValue)
					? function(value) { return ''; }
					: argumentDef.checkValue;
					
				var argumentValue = getArgument(argumentName);
				if (null == argumentValue) argumentValue = defaultValue;
				
				if (null == argumentValue && mandatory) {
					var message = "The argument '" + argumentName + "' is mandatory.";
					
					throw {
						code : 412,
						message : 'IllegalStateException! ' + message
					}
				}
				
				var errorMessage = checkValue(argumentValue); 
				if (errorMessage) { // checkValue returned a non-null String
					var message = "The argument '" + argumentName + "' is invalid: " + errorMessage;
					
					throw {
						code : 412,
						message : 'IllegalStateException! ' + message
					}
				}
				
				me[argumentName] = argumentValue;
			}
		}
	
		function getArgument(argumentName) {
			// Look for an HTTP POST JSON content argument
			if ('undefined' != typeof json && json.has(argumentName)) {
				var jsonArgument = json.get(argumentName);
				if (jsonArgument) return jsonArgument;
			}
			
			// Look for an HTTP GET argument
			var getArgument = args[argumentName];
			if (getArgument) return getArgument;
			
			// Look for an HTTP POST formdata argument 
			if ('undefined' != typeof formdata && formdata.fields) {
				for (var i = 0, len = formdata.fields.length; i < len; i++) {
					var field = formdata.fields[i];
					if (argumentName == field.name) return field.value;
				}
			}
			
			return null;
		}
		
	}
	
})();