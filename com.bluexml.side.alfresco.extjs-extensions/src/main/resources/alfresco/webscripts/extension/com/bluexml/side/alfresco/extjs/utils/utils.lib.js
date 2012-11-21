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
	
	Utils.contains = function(array, value) {
		
		var contains = false;
		
		Utils.forEach(array, function(arrayElement) {
			contains = contains || arrayElement === value;
			if (true === contains) return;
		});
		
		return contains;
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
			
			var childNode = segment.indexOf(':') >= 0 
				? currentNode.childrenByXPath(segment)[0] 
				: currentNode.childByNamePath(segment)
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
	
    Utils.Alfresco.getPersonDisplayName = function(person) {
    	
    	if (isPersonScriptNode(person)) 
    		return Utils.Alfresco.getDisplayName(person.properties.firstName, person.properties.lastName);
    	
    	if ('string' == typeof person)
    		return Utils.Alfresco.getDisplayName(person /* username */);
    		
    	throw new Error('IllegalArgumentException! The provided person is not a valid person');    	
    }
    
    Utils.Alfresco.getDisplayName = function(firstName, lastName) {
    	
    	if (undefined === lastName) {
    		// firstName is supposed to be a username
    		if (!firstName) {
    			throw new Error('IllegalArgumentException! At least the firstName or the userName has to be provided.');
    		}
    		
    		var 
    			username = firstName,
				person = Common.getPerson(Utils.asString(username))
			;
			firstName = person.firstName;
			lastName = person.lastName;			
    	}
    	
    	firstName = firstName || '';
    	lastName = lastName || '';
    	var displayName = firstName + (firstName ? ' ' : '') + lastName;
    	
    	return displayName.replace(/^\s+|\s+$/g, "");
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
		
		var siteNode = site.node;
		if (!siteNode.isSubType('st:site')) {
			throw new Error('IllegalStateException! The site is not of expected type st:site');
		}

		return siteNode;
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
    
})();