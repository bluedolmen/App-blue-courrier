(function() {
	
	root = this;
	if ('undefined' !== typeof Utils) return; // do not redefine if included several times
	
	Utils = {};
	
	Utils.ns = function(ns) {
	 	var object = root || this;
	 	Utils.forEach(ns.split('.'), function(nspart) {
			if (undefined === object[nspart]) object[nspart] = {};
			object = object[nspart];
	 	});
	 	return object;
	};
	
	Utils.emptyFn = function() {/* do nothing */};
	
	Utils.asString = function(object) {
		return '' + object;
	};
	
	/**
	 * Helper method that tests whether the given argument is a javascript Array
	 * 
	 * @param {Object}
	 *            object the object to be tested
	 */
	Utils.isArray = function(object) {
		
		return (
			(object instanceof Array) ||
			(toString.call(object) === '[object Array]')
		);
		
	};
	
	
	Utils.isFunction = function(object) {
		return 'function' === typeof object;
	}

	/**
	 * Apply an operation on each element of the given array
	 * <p>
	 * The loop can be broken by returning false on operation
	 */
	Utils.forEach = function(array, operation, reverse, scope) {
		
		if (! Utils.isArray(array)) {
			throw new Error('IllegalArgumentException! The provided array element is not a valid Array');
		}
		
		if (! (operation instanceof Function)) {
			throw new Error('IllegalArgumentException! The provided applyMethod is not a valid Function');
		}
		
		if (reverse) {
			for (var i = array.length - 1; i >= 0; i--) {
				if (false === operation.call(undefined === scope ? array[i] : scope, array[i], i == 0))
					break;				
			}
		} else {		
			for (var i = 0, len = array.length; i < len; i++) {
				if (false === operation.call(undefined === scope ? array[i] : scope, array[i], i == len - 1))
					break;
			}
		}
		
	};
	
	Utils.isArrayEmpty = function(array) {
		
		if (! Utils.isArray(array)) {
			throw new Error('IllegalArgumentException! The provided array element is not a valid Array');
		}
		
		return 0 === array.length;
	};

	
	Utils.map = function(array, transform, reverse, scope) {		
		
		var result = [];
		
		Utils.forEach(
			array,
		
			/* operation */
			function(arrayElement, isLast) {
				var transformedValue = transform.call(undefined === scope ? arrayElement : scope, arrayElement, isLast);
				if ('undefined' == typeof transformedValue) return;
				
				result.push(transformedValue);
			},
			
			reverse
		);		
		
		return result;
	};
	
	Utils.reduce = function(array, aggregateOperation, initValue, reverse, scope) {
		
		var aggregateValue = (initValue === undefined) ? {} : initValue;
		
		Utils.forEach(
			array,
			
			/* operation */
			function(arrayElement, isLast) {
				var postAggregateValue = aggregateOperation.call(undefined === scope ? arrayElement : scope, arrayElement, aggregateValue, isLast);
				if (undefined !== postAggregateValue) aggregateValue = postAggregateValue;
			},
			
			reverse
		);
		
		return aggregateValue;
	};
	
	Utils.filter = function(array, acceptFunction) {
		
		var filteredResult = [];
		
		Utils.forEach(array, function(arrayElement) {
			
			var accepted = acceptFunction(arrayElement);
			if ('undefined' == typeof accepted) return; // continue 
			
			if (accepted) filteredResult.push(arrayElement);
		});

		return filteredResult;
	};
	
	Utils.contains = function(array, value, equalsFunction) {
		
		var contains = false;
		equalsFunction = Utils.isFunction(equalsFunction) ? equalsFunction :
			function(a,b) {
				return a == b;
			}
		
		Utils.forEach(array, function(arrayElement) {
			contains = contains || equalsFunction(arrayElement, value);
			if (true === contains) return false; // stop iteration
		});
		
		return contains;
	};

	Utils.exists = function(array, acceptFunction) {
		
		if (!Utils.isFunction(acceptFunction)) return false;
		
		var exists = false;
		Utils.forEach(array, function(arrayElement) {
			exists = exists || acceptFunction(arrayElement);
			if (true === exists) return false; // stop iteration
		});
		
		return exists;
	};	
	
	/**
	 * Remove null values from the array
	 */
	Utils.clear = function(array) {
		
		return Utils.filter(array, function(arrayElement) {
			return (null !== arrayElement);
		});
		
	}

    Utils.unwrapList = function(array) {
    	
		if (! Utils.isArray(array)) {
			throw new Error('IllegalArgumentException! The provided array element is not a valid Array');
		}
    	
		var len = array.length;
		if (0 == len) return null;
		if (1 == len) return array[0];
		
		return array;
    };
    
    Utils.wrapAsList = function(element) {
    	
    	if (Utils.isArray(element)) return element;
    	if (null == element) return [];
    	
    	return [element];
    	
    };
    
    Utils.ArrayToMap = function(array, keyFunction) {
    	
    	if (!array) return {};
    	
    	keyFunction = keyFunction || function(object) {return object.toString();}; // Default returns the toString() value
    	
    	var result = {};
    	Utils.forEach(array,
    		function(object) {
    			var key = keyFunction(object);
    			if (!key) return; // skip undefined keys
    			
    			result[key] = object;
    		}
    	);
    	
    	return result;
    };
    
    Utils.mapOfArray = Utils.ArrayToMap;
    
    Utils.arrayToMap = Utils.ArrayToMap; 
    
	Utils.escapeQName = function(qname) {
		if (null == qname) {
			throw new Error('IllegalArgumentException! The provided QName is not valid');
		}
		
		return qname.replace(/:/,'\\:');
	};
	
	/**
	 * This is a slightly modified version of the ExtJS apply function which
	 * copy all the properties from config to object applying potential defaults
	 * (as a third argument)
	 */
    Utils.apply = function(object, config, defaults) {
    	
        if (defaults) {
            Ext.apply(object, defaults);
        }

        if (! (object && config && 'object' === typeof config ) ) return object;
        	
        for (var property in config) {
            object[property] = config[property];
        }

        return object;
    };
    
    Utils.applyIf = function(object, config) {
    	
        if (! (object && config && 'object' === typeof config ) ) return object;
    	
        for (var property in config) {
            if (undefined !== object[property]) continue;
			object[property] = config[property];
        }

        return object;
    };    
	
    Utils.merge = function(object, config) {
    	
        if (! (object && config && 'object' === typeof config ) ) return object;
    	
        for (var property in config) {
        	var value = object[property];
        	
            if (undefined === value) {
				object[property] = config[property];
            } else if (value && 'object' === typeof value) { // merge objects
            	
            	var mergedValue = config[property];
            	if (mergedValue && 'object' === typeof mergedValue) {
            		Utils.merge(value, mergedValue);
            	}
            	
            }
        }

        return object;    	
    	
    }
    
    Utils.sortNodes = function(array, propertyNameOrFunction, compareFunction) {
    	
    	if (!Utils.isArray(array)) {
    		throw new Error('IllegalArgumentException! The provided array of nodes is not a valid array.');
    	}
    	
    	propertyNameOrFunction = ('undefined' === typeof propertyNameOrFunction ? 'cm:name' : propertyNameOrFunction);
    	
    	var compareFunction = compareFunction ||
    		function(a,b) {
    			if (a == b) return 0;
    			a < b ? -1 : 1;
    		}
    	;
    		
    	var sortingFunction = Utils.isFunction(propertyNameOrFunction) ? propertyNameOrFunction  :
    		function(node1, node2) {
    			var val1 = node1 ? node1.properties[propertyNameOrFunction] : '';
    			var val2 = node2 ? node2.properties[propertyNameOrFunction] : '';
    			return compareFunction(val1,val2);
    		}
    	
    	return array.sort(sortingFunction);
    };
    
    

	
	Utils.String = {};
	
	Utils.String.trim = function(str) {
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	
	Utils.String.capitalize = function(str) {
		if (!str) return '';
		return str.charAt(0).toUpperCase() + str.substr(1);
	}
	
	Utils.String.startsWith = function(str, start) {
		return (0 == str.indexOf(start));
	}
	
	Utils.String.join = function(array, sep) {
		if (!array) return '';
		if (!sep) sep = ' ';
		
		return Utils.reduce(
			array, 
			function(strPart, str, isLast) {
				return str + strPart + (isLast ? '' : sep);
			},
			"" // initialValue
		);
	}
	
	Utils.String.leftPad = function(string, size, character) {
        character = character || " ";
        var result = String(string);
        while (result.length < size) {
            result = character + result;
        }
        return result;
	}
	
	Utils.String.emailRegex = /^([a-zA-Z0-9_\.\-]+)\@(?:([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; 
	
	Utils.String.isEmail = function(value, trim /* default = false */) {
		if (!value) return false;
		
		return Utils.String.emailRegex.test(
			true === trim ? Utils.String.trim(value) : value 
		);
	}
	
	Utils.Alfresco = {};
	
	Utils.Alfresco.isScriptNode = function(node) {
		return (undefined !== node.typeShort); // weak testing?
	};
	
	Utils.Alfresco.getCompanyHome = function() {
		
		if ('undefined' == typeof companyhome) {
			var companyhome = search.xpathSearch('/app:company_home')[0];
		}		
		
		if (companyhome) return companyhome;
		else throw new Error('IllegalStateException! Cannot get CompanyHome node');
	}
	
	Utils.Alfresco.getLuceneAttributeFilter = function(propertyQName, value, encodeValue) {
		
		// !!! Mandatory here! Use an ancilliary variable else the returned result is undefined !!!
		var result =
			'@' +
			Utils.escapeQName(propertyQName) +
			':' +
			'\"' + (encodeValue ? search.ISO9075Encode(value) : value) + '\"';
		
		return result;
	}
	
	Utils.Alfresco.createPath = function(rootNode, path, createFolderHandler) {
		
		if (path.indexOf('/') == 0) { // ignore starting '/'
			path = path.substr(1);
		}
		
		var companyHomePrefix = 'app:company_home/';
		if (Utils.String.startsWith(path, companyHomePrefix)) {
			path = path.substr(companyHomePrefix.length); // +1 discards the leading '/' character
			rootNode = Utils.Alfresco.getCompanyHome();
		}
		
		var 
			segments = path.split('/'),
			currentNode = rootNode
		;	
		
		createFolderHandler = createFolderHandler ||
			function(parentNode, childName) {
				return parentNode.createFolder(childName);
			}
		;
			
		Utils.forEach(segments, function(segment) {
			
			var 
                prefixedName = segment.indexOf(':') >= 0  ? segment : null,
                fileName = prefixedName  ? segment.split(':')[1] : segment,
                  
                childNode = prefixedName
                  ? currentNode.childrenByXPath(prefixedName)[0] 
                  : currentNode.childByNamePath(fileName)
			;			
			if (!childNode) {
				childNode = createFolderHandler(currentNode, segment);
			}
			
			currentNode = childNode;
		});
		
		return currentNode;
	}

	/**
	 * @private
	 */
    function isPersonScriptNode(person) {
    	if (null == person) return false;
    	return ('cm:person' === Utils.asString(person.typeShort));
    }	
	
    Utils.Alfresco.getPersonDisplayName = function(person, displayUserName) {
    	
    	displayUserName = (true === displayUserName);
    	
    	var
    		personNode = person,
    		firstName = '',
    		lastName = '',
    		userName = ''
    	;
    	
    	
		if (!isPersonScriptNode(personNode)) { // has to be tested before since typeof is buggy on ScriptNode for now
			
	    	if ('string' == typeof person) {
	    		
	    		personNode = people.getPerson(person);
	    		if (null == personNode) return person; // don't known how to interpret the provided string
	    		
	    	} else {
	    		throw new Error('IllegalArgumentException! The provided person argument is not of a recognized type');
	    	}
	    	
		}
			
		firstName = personNode.properties.firstName;
		lastName = personNode.properties.lastName;
		if (displayUserName) {
			userName = personNode.properties.userName;
		}
    	
    	return Utils.Alfresco.getDisplayName(firstName, lastName, userName);
    }
    
    Utils.Alfresco.getDisplayName = function(firstName, lastName, userName) {
    	
    	firstName = Utils.String.trim(firstName) || '';
    	lastName = Utils.String.trim(lastName) || '';
    	
    	var displayName = 
    		firstName + (firstName ? ' ' : '') + 
    		lastName + 
    		( userName ? (' (' + userName + ')') : '' )
    	;
    	
    	return displayName;
    }
    
    
    Utils.Alfresco.getPersonUserName = function(person) {
    	
    	if (isPersonScriptNode(person)) return Utils.asString(person.properties.userName);
    	// typeof person on ScriptNode throws an exception and has to be performed after the isPersonScriptNode test
    	if ('string' == typeof person) return person || ''; 
    	
    	throw new Error('IllegalArgumentException! The provided person is not a valid person');
    	
    }
    
    Utils.Alfresco.getPersonAvatarUrl = function(person) {
    	
    	if (null == person) return '';
    	
    	if (!isPersonScriptNode(person)) {
    		person = people.getPerson(person);
	    	if (null == person) return '';
    	}
    	
    	var avatars = person.assocs['cm:avatar'];
    	if (null == avatars || 0 == avatars.length) return '';
    	
		var 
			avatar = avatars[0],
			url = 'api/node/' + avatar.storeType + '/' + avatar.storeId + '/' + avatar.id + '/content/thumbnails/avatar'
		;
		
		return url;
    	
    }
    
    Utils.Alfresco.getCurrentUserName = function() {
    	return Utils.Alfresco.getPersonUserName(person); // Use person global Object defined as the currently authenticated user
    }
    
    Utils.Alfresco.getFullyAuthenticatedUserName = function() {
    	
    	if ('undefined' == typeof sideAuthenticationUtil) {
    		logger.warn('Cannt get the sideAuthenticationUtil object to get the actual logged user. Returning current user-name instead.');
    		return Utils.Alfresco.getCurrentUserName();
    	}
    	
    	var fullyAuthenticatedUser = sideAuthenticationUtil.getFullyAuthenticatedUser();
    	return Utils.asString(fullyAuthenticatedUser);
    	
    }	
	
	/**
	 * Get a site whether the provided parameter is a string, a site node,
	 * or a site object (the one returned by the site-service
	 */
	Utils.Alfresco.getSiteNode = function(site) {
			
		if (Utils.Alfresco.isScriptNode(site)) {
			return site;
		}
		if ('string' == typeof site) {
			site = siteService.getSite(site);
		}
		
		if (null == site) return null; // site does not exist
		
		var siteNode = null != site.node ? site.node : site;
		if (!Utils.Alfresco.isScriptNode(siteNode)) {
			throw new Error("IllegalArgumentException! The provided site attribute '" + site + "' does not match any known site type.");
		}
		
		if (!siteNode.isSubType('st:site')) {
			throw new Error('IllegalStateException! The site is not of expected type st:site');
		}

		return siteNode;
		
	}

	Utils.Alfresco.getSiteTitle = function(site) {
		
		var siteNode = Utils.Alfresco.getSiteNode(site);
		if (!siteNode) return '';
		
		return siteNode.properties['cm:title'];
		
	}

	/**
	 * Returns a unique name that can be used to create a
	 * child of the given parentNode.
	 *
	 * The name will be of form prefix_yyyy-mm-dd_hh-mm["","_x"],
	 * where x represents a number > 1 and is only added if a node
	 * with the base name already exists
	 *
	 * The date parameter is for testing and needn't be used.
	 * 
	 * This is extracted from nodenameutils.lib.js from Alfresco source code (4.0.d)
	 */
	Utils.Alfresco.getUniqueChildName = function(parentNode, prefix, date) {
		
		if ('undefined' === typeof date) {
			date = new Date();
		}
		
		var 
			namePrefix = prefix + '-' + date.getTime(), 
			name = namePrefix,
			count = 0
		;

		if (null == parentNode.childByNamePath(name)) {
			return name;
		}
		
		name = namePrefix + "_" + Math.floor(Math.random() * 1000);
		
		while (null != parentNode.childByNamePath(finalName) && count < 100) {
			name = namePrefix + "_" + Math.floor(Math.random() * 1000);
			++count;
		}
		
		return name
		
	}
	
	
	Utils.Object = {
		
		/*
		 * Used for prototypal inheritence
		 */
		create : function(prototype, override, initArgs) {
			
			var 
				F = function() {},
				newInstance = null
			;
			F.prototype = prototype;
						
			newInstance = new F();
			if (override) {
				Utils.apply(newInstance, override);
			}
			
			if (undefined !== newInstance._init) {
				newInstance._init.apply(newInstance, initArgs);
			}
			
			return newInstance;
		},
		
		/*
		 * Used for parasitic combination inheritence
		 */
		extend : function(subType, superType) {
			var prototype = Utils.Object.create(superType.prototype);
			prototype.constructor = subType;
			subType.prototype = prototype;
		}		
		
	};
	
	
	Utils.Error = {
		
		raise : function(message, exception) {
			throw new Error(message);
		}
		
	};
	
	Utils.Cache = {
		
		_cacheSize : 10,
		_cache : {},
		_timeLine : [],
		
		create : function(cacheSize, name) {
			
			var newCache = Utils.Object.create(Utils.Cache, {
				_cacheSize : cacheSize,
				_name : name || ''
			});
			
			delete newCache.create;
			return newCache;
			
		},
		
		getValue : function(key) {
			return this._cache[key];
		},
		
		setValue : function(key, value) {
			
			if (this._cacheSize == this._timeLine.length) {
				var removedKey = this._timeLine.shift();
				delete this._cache[removedKey];
			}
			
			this._cache[key] = value;
			this._timeLine.push(key);
		},
		
		getOrSetValue : function(key, computeFun, funArgs, scope) {
			var value = this.getValue(key);
			if (undefined == value) {
				value = computeFun.apply(scope || this, funArgs || []);
				this.setValue(key, value);
			}
			
			return value;
		},
		
		reset : function() {
			this._cache = {},
			this._timeLine = []
		}
		
	};
	
    
})();