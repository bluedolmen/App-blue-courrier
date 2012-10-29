(function() {

	const MAX_LEVEL_DIGIT_NB = 3;
	
	InitUtils = {
		
		constructor : function() {
			var _anonymousCounter = 0;
			this.getAnonymousIndex = function() {
				return ++_anonymousCounter;
			};
			return this;
		},
		
		register : function(initFunction, level) {
			
			level = level || Number(Utils.String.leftPad('' + level, MAX_LEVEL_DIGIT_NB, '9'));
			
			if (!Utils.isFunction(initFunction)) {
				throw new Error('IllegalArgumentException! The provided init-function is not a valid function');
			}
			
			if ('number' != typeof level) {
				throw new Error('IllegalARgumentException! The provided level is not a valid number as expected');
			}
			
			var
				functionName = initFunction.name || ('anonymous' + this.getAnonymousIndex());
				functionNameWithLevel = Utils.String.leftPad('' + level, MAX_LEVEL_DIGIT_NB, '0') + '-' + functionName 
			;
			
			this[functionName] = initFunction;
			this[functionNameWithLevel] = initFunction;
		},
		
		init : function(initFunctionName) {
			
			if (!initFunctionName) {
				throw new Error('IllegalArgumentException! The init function-name has to be valid');
			}
			var initFunction = this[initFunctionName];
			if (!initFunction || !Utils.isFunction(initFunction)) {
				throw new Error("IllegalArgumentException! The init function-name '" + initFunctionName + "' does not refer to a registered init-function");
			}
			
			var shiftedArgs = []; // slice does not work on arguments with Rhino !...
			for(var i = 1, len = arguments.length; i < len; i++) {
				shiftedArgs.push(arguments[i]);
			}
			
			return initFunction.apply(this, shiftedArgs);
			
		},
		
		initAll : function() {
	
			var registeredInitFunctions = this.getRegistered();
			
			Utils.forEach(registeredInitFunctions, function(initFunctionName) {
				logger.log("Starting init script '" + initFunctionName + "'");
				me[initFunctionName]();
			});
			
		},
		
		getRegistered : function() {
			var
				me = this,
				matchingInitFunctions = []
			;
			for (key in this) {
				var match = /^[0-9]+-(.*)$/.exec(key);
				if (match) {
					matchingInitFunctions.push(match[1]);
				}
			}
			matchingInitFunctions.sort();
			
			return matchingInitFunctions;
		},
		
		showRegistered : function() {
			var registeredInitFunctions = this.getRegistered();
			
			Utils.forEach(registeredInitFunctions, function(initFunctionName) {
				logger.log(initFunctionName);
			});			
		}
		
	}

})();