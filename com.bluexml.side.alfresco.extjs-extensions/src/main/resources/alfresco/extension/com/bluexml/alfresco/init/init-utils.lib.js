(function() {

	const MAX_LEVEL_DIGIT_NB = 3;
	
	Init = {};
	
	Init.Register = new (function() {
		var registeredInitFunctions = []; // may be made private
		
		this.getRegisteredFunctions = function() {
			return registeredInitFunctions.slice();
		}
		
		this.register = function (initFunctionDefinition) {
			registeredInitFunctions.push(initFunctionDefinition);
		}
	})();
	
	Init.InstallationStates = {
		FULL : 'full', // Completely installed
		MODIFIED : 'modified', // Differs from the out-of-the-box installed version
		PARTIALLY : 'partially', // Not completely up-to-date with the installation version
		NO : 'no', // Not installed
		UNKNOWN : 'unknown' // The state is not checkable (problem during evaluation)
	}	
		
	Init.InitDefinition = Utils.Object.create({		
		
		init : Utils.emptyFn,
		
		reset : function() {
			this.clear();
			this.init();
		},
		
		clear : null,
		
		checkInstalled : function() {
			return InitFunction.InstallationStates.UNKNOWN;
		},
		
		getDetails : null
		
	});	
	
	Init.InitDefinition.BySite = Utils.Object.create(Init.InitDefinition, {

		init : function() {
			
			if (null == this.initSite || !Utils.isFunction(this.initSite)) return;
				
			var 
				me = this,
				siteList = this.getSiteList()
			;
			Utils.forEach(siteList, function(site) {
				var siteName = me.getSiteName(site);
				me.initSite(site);
			});			

		},
		
		initSite : null,
		
		clear : function() {
			
			if (null == this.clearSite || !Utils.isFunction(this.clearSite)) return;
				
			var 
				me = this,
				siteList = this.getSiteList()
			;
			Utils.forEach(siteList, function(site) {
				var siteName = me.getSiteName(site);
				me.initSite(site);
			});			

		},
		
		clearSite : null,
		
		getSiteList : function() {		
			return siteService.listSites('','');
		},
		
		getSiteName : function(site) {  return site.shortName; }		
		
	});	
	
	Init.Utils = Utils.Object.create({
		
		_init : function() {
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
		
	});
		
	
})();