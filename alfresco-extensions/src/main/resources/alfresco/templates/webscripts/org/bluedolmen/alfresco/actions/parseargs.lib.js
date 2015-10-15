(function() {
	
	ParseArgs = function() {
		
		var 
			me = this,
			argumentDefs = arguments
		;
		
		// Handle the case where ParseArgs arguments is defined with an array
		if (argumentDefs.length == 1 && Utils.isArray(argumentDefs[0])) {
			argumentDefs = argumentDefs[0];
		}
		
		parseargs();
		
		function parseargs() {
			
			var j, jlen, argumentDef;
			
			for (j = 0, jlen = argumentDefs.length; j < jlen; j++) {
				argumentDef = argumentDefs[j];
				if (!argumentDef) continue;
				
				var 
					argumentName = 'string' == typeof argumentDef
						? argumentDef
						: argumentDef.name,
					
					mandatory = 'string' == typeof argumentDef
						? false
						: argumentDef.mandatory,
					
					defaultValue = 'string' == typeof argumentDef
						? null
						: argumentDef.defaultValue,
					
				
					checkValue = ('string' == typeof argumentDef) || (!argumentDef.checkValue)
						? function(value) { return ''; }
						: argumentDef.checkValue,
					
					
					argumentValue = getArgument(argumentName)
				;
				if (null == argumentValue) argumentValue = defaultValue;
				
				if (null == argumentValue && mandatory) {
					var message = "The argument '" + argumentName + "' is mandatory.";
					
					throw {
						code : 400,
						message : 'IllegalStateException! ' + message
					}
				}
				
				var errorMessage = checkValue(argumentValue); 
				if (errorMessage) { // checkValue returned a non-null String
					var message = "The argument '" + argumentName + "' is invalid: " + errorMessage;
					
					throw {
						code : 400,
						message : 'IllegalStateException! ' + message
					}
				}
				
				me[argumentName] = argumentValue;
			}
		}
	
		function getArgument(argumentName) {
			
			var jsonArgument, i, len, field;
			
			// Look for template argument
			if (null != url.templateArgs[argumentName]) {
				return url.templateArgs[argumentName];
			}
			
			// Look for an HTTP POST JSON content argument
			if ('undefined' != typeof json && json.has(argumentName)) {
				jsonArgument = json.get(argumentName);
				if (jsonArgument) return jsonArgument;
			}
			
			// Look for an HTTP POST formdata argument 
			if ('undefined' != typeof formdata && null != formdata.fields) {
				for (i = 0, len = formdata.fields.length; i < len; i++) {
					field = formdata.fields[i];
					
					if (argumentName == field.name) {
						if (field.isFile) return field;
						else return field.value;
					}
				}
			}
			
			// Look for an HTTP GET argument
			var getArgument = args[argumentName];
			if (getArgument) return getArgument;
			
			return null;
		}
		
	}
		
})();