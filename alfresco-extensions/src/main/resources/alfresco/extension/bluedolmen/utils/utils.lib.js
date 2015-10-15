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
	
	Utils.keys = function(obj) {
		
	    var 
		    hasOwnProperty = Object.prototype.hasOwnProperty,
		    result = []
		;

		if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null)
			throw new TypeError('Utils.keys called on non-object');

		for (var prop in obj) {
			if (hasOwnProperty.call(obj, prop)) result.push(prop);
		}

		return result;
		
	};
	
	
	Utils.emptyFn = function() {/* do nothing */}
	Utils.idFn  = function(value) {return value;} // identity function
	
	Utils.asScriptNode = function(node) {
		
		if (Utils.Alfresco.isScriptNode(node)) return node;
		if (Utils.Alfresco.isNodeRef(node)) return search.findNode(Utils.asString(node));
		
		return null;
		
	};
	
	Utils.asString = function(object) {
		if (null == object) return '';
		return '' + object;
	};
	
	/**
	 * Test whether the provided object is a String, being either a native
	 * Javascript string, or a Java wrapped String.
	 */
	Utils.isString = function(object) {
		
		if (null == object) return false;
		if (Utils.isFunction(object.getClass)) {
			return ('java.lang.String' == object.getClass().getName());
		}
		if ('string' == typeof object) return true;
		
		return false;
		
	};

	/**
	 * Get a native Javascript String discarding the difference between native
	 * and wrapped Java Strings.
	 * 
	 * Note that the behaviour is different from asString() that returns
	 * inconditionnaly a native String from the provided object.
	 */
	Utils.wrapString = function(object) {
		if (Utils.isString(object)) return Utils.asString(object);
		else return null;
	}
	
	/**
	 * Really simple parsing method to get a native JavaScript date from an
	 * ISO8601 formatted-like string
	 */
	Utils.asDate = function(str) {
		
		var 
			splitDate = Utils.asString(str).split('-'),
			year, month, day
		;
		if (splitDate.length < 3) return null;
		
		year = splitDate[0];
		month = splitDate[1];
		day = splitDate[2];
		
		return new Date(parseInt(year), parseInt(month) - 1 /* 0 based */, parseInt(day), 0, 0, 0, 0);
		
	}
	
	Utils.javaEqualsFunction = function(a, b) {

		if (null == a) return null == b;
		if (undefined === a.equals) return false;
		return a.equals(b);

	};
	
	Utils.isFunction = function(object) {
		
		if (null == object) return false;
		if (Utils.isFunction(object.getClass)) return false; // prevent incorrect Java wrapped objects
		
		return 'function' === typeof object;
		
	}

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
	
	Utils.isJavaArray = function(object) {
		return (undefined !== object.getClass && 'class java.util.ArrayList' == object.getClass());
	}
	
	Utils.toArray = function(object) {
		
		var
			i = 0, 
			len = 0,
			result = []
		;
		
		if (null == object) return [];
		
		if (undefined !== object.length) {
			
			for (i = 0, len = object.length; i < len; i++) {
				result.push(object[i]);
			}
			
		}
		else if (Utils.isFunction(object.size)) {
			
			for (i = 0, len = object.size(); i < len; i++) {
				result.push(object.get(i));
			}
			
		}
		else {
			return [result];
		}
		
		return result;
		
	};
	
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
				if (undefined === transformedValue) return;
				// The following line fails at processing "unvalid" ScriptNode
				// value. If the previous test does not match all the situations, we
				// need to diagnose the problem more deeply.
				// A (unwanted) possibility would try/catch the test...
//				if ('undefined' == typeof transformedValue) return;
				
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
	
	Utils.contains = function(array, value /* or matchFunction */) {
		
		if (!Utils.isArray(array)) return false;
		
		return -1 != Utils.indexOf(array, value);
		
	};

	Utils.indexOf = function(array, value /* or matchFunction */) {
		
		if (!Utils.isArray(array)) return -1;
		
		var 
			matchFunction = Utils.isFunction(value) ?
				value 
				: function(v) { return value == v; }
			,
			index, len, arrayElement
			
		;
		
		for (index = 0, len = array.length; index < len; index++) {
			arrayElement = array[index];
			if ( matchFunction(arrayElement, value) ) return index;
		}
		
		return -1;
		
	};
	
	Utils.lastIndexOf = function(array, value /* or matchFunction */, getValueFunction) {
		
		if (!Utils.isArray(array)) return -1;
		
		var 
			matchFunction = Utils.isFunction(value) ?
				value 
				: function(v) { return value == v; }
			,
			index, len, arrayElement, lastIndex = -1
			
		;
		
		for (index = 0, len = array.length; index < len; index++) {
			arrayElement = array[index];
			if ( matchFunction(arrayElement, value) ) {
				lastIndex = index;
			}
		}
		
		return lastIndex;
		
	};
	
	
	Utils.first = function(array, matchingFunction) {
		
		if (!Utils.isFunction(matchingFunction)) {
			Utils.Error.raise("IllegalArgumentException! The provided equals-function is not a valid function");
		}
		
		var firstMatching = null;
		
		Utils.forEach(array, function(arrayElement) {
			if (matchingFunction(arrayElement)) {
				firstMatching = arrayElement;
				if (null != firstMatching) return false; // stop iteration
			}
		});
		
		return firstMatching;
		
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
	
	Utils.every = function(array, acceptFunction) {
		
		if (!Utils.isFunction(acceptFunction)) return false;
		
		var every = true;
		
		Utils.forEach(array, function(arrayElement) {
			every = every && acceptFunction(arrayElement);
			if (false === every) return false; // stop iteration
		});
		
		return every;
		
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
    
    /**
     * Provides a map from an Array
     * @param {Array} array the array of elements
     * @param {Function} keyFunction The function that returns a index string from the an array element
     *  Value "null" defines the toString() method
     * @param {Function/Boolean} duplicateFunction the Function that "mixes/assembles" the previous existing
     * 	Value "True" defines the default function which concatenates the elements in a list (keep the historic
     *  behavior)
     */
    Utils.ArrayToMap = function(array, keyFunction, duplicateFunction) {
    	
    	if (!array) return {};
    	
    	function concat(previous, elem) {
    		return (previous || []).concat([elem]);
    	} 
    	
    	keyFunction = keyFunction || function(object) { return Utils.asString(object); }; // Default returns the toString() value
    	duplicateFunction = ( Utils.isFunction(duplicateFunction) ? duplicateFunction : (true === duplicateFunction ? concat : null) );
    	
    	var result = {};
    	
    	Utils.forEach(array,
    		function(object) {
    			var key = keyFunction(object);
    			if (!key) return; // skip undefined keys
    			
    			result[key] = null == duplicateFunction
    				? object
    				: duplicateFunction(result[key], object)
    			;
    				
    		}
    	);
    	
    	return result;
    };

    
    Utils.mapOfArray = Utils.ArrayToMap;
    
    Utils.arrayToMap = Utils.ArrayToMap; 
    
	//Array Remove - By John Resig (MIT Licensed)
	function Array_remove(array, from, to) {
		
		if (! Utils.isArray(array)) {
			throw new Error('IllegalArgumentException! The provided array element is not a valid Array');
		}
		
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
		
    }
	
	Utils.Array = {
			forEach : Utils.forEach,
			isEmpty : Utils.isArrayEmpty,
			map : Utils.map,
			reduce : Utils.reduce,
			filter : Utils.filter,
			contains : Utils.contains,
			indexOf : Utils.indexOf,
			lastIndexOf : Utils.lastIndexOf,
			first : Utils.first,
			exists : Utils.exists,
			every : Utils.every,
			clear : Utils.clear,
			unwrapList : Utils.unwrapList,
			toMap : Utils.ArrayToMap,
			remove : Array_remove
	};
    
	/**
	 * This is a slightly modified version of the ExtJS apply function which
	 * copy all the properties from config to object applying potential defaults
	 * (as a third argument)
	 */
    Utils.apply = function(object, config, defaults) {
    	
        if (defaults) {
            Utils.apply(object, defaults);
        }

        if (! (object && config && 'object' === typeof config ) ) return object;
        	
        for (var property in config) {
            object[property] = config[property];
        }

        return object;
    };
    
    Utils.applyIf = function(object, config, skippedIf) {
    	
        if (! (object && config && 'object' === typeof config ) ) return object;
    	
        skippedIf = skippedIf || function(value) {
        	return (undefined !== value); 
        }
        
        for (var property in config) {
            if (skippedIf(object[property])) continue;
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
    

	
	Utils.String = {};
	
	Utils.String.isBlank = function(str) {
		
		return (
			str == null ||
			/^\s*$/.test(str)
		);
		
	}
	
	Utils.String.hashCode = function(str) {
		
        var hash = 0, i, len, char_;
        if (str.length == 0) return 0;
        
        for (i = 0, len = str.length; i < len; i++) {
            char_ = str.charCodeAt(i);
            hash = ( (hash<<5) - hash ) + char_;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash;
        
    }
	
	Utils.String.trim = function(str) {
		return Utils.asString(str).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
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
	
	Utils.String.splitToTrimmedStringArray = function(str, sep) {
		
		 var 
		 	m = (/^\s*\[(.*)\]\s*$/).exec(str), // strips array form
		 	elems
		 ;
		 
		 if (!sep) {
		 	sep = ',';
		 }
		 
		 if (m) {
		 	str = m[1];
		 }
		 
		 if (!str) {
		 	return [];
		 }
		 
		 elems = str.split(sep);
		 return Utils.map(elems, function(elem) {
			 return Utils.String.trim(elem)
			 	.replace(/^[\"\']/, '')
			 	.replace(/[\"\']$/, '')
			 ;
		 });
		 
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
	
	var FORMAT_REGEXP = /\{(\d+)\}/g;
	Utils.String.format = function(format) {
	    var args = Utils.toArray(arguments).slice(1);
	    return Utils.asString(format).replace(FORMAT_REGEXP, function(m, i) { return args[i];});
	},
	
	
	Utils.Alfresco = {};
	
	Utils.escapeQName = function(qname) {
		if (null == qname) {
			throw new Error('IllegalArgumentException! The provided QName is not valid');
		}
		
		return qname.replace(/:/,'\\:');
	};
	
	Utils.Alfresco.escapeQName = Utils.escapeQName;
	
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
    
    Utils.Alfresco.sortNodes = Utils.sortNodes;
    
	Utils.Alfresco.isScriptNode = function(node) {
		return (undefined !== node.typeShort); // weak testing?
	};
	
	Utils.Alfresco.NODEREF_REGEXP = /^(\w*):\/\/(\w*)\/([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/;
	
	Utils.Alfresco.isNodeRef = function(nodeRef) {
		
		if (!Utils.isString(nodeRef)) return false;
		return Utils.Alfresco.NODEREF_REGEXP.test(nodeRef);
		
	};
	
	Utils.Alfresco.getExistingNode = function(nodeRef, failsSilently) {
		
		if (null == nodeRef) return null;
		if (Utils.Alfresco.isScriptNode(nodeRef)) return nodeRef; 
		
		if (Utils.isString(nodeRef)) {
			
			if (Utils.Alfresco.isNodeRef(nodeRef)) {
				var documentNode = search.findNode(nodeRef);
				if (null != documentNode) return documentNode;
			}
			
			// Try to solve by XPath w.r.t. CompanyHome
			var 
				companyHome = Utils.Alfresco.getCompanyHome(),
				matchingChildren = companyHome.childrenByXPath(nodeRef)
			;
			if (1 == matchingChildren.length) return matchingChildren[0];
			
		}

		if (failsSilently) return null;
		
		throw new Error("IllegalStateException! The document-node with nodeRef '" + nodeRef + "' does not exist");
		
	};
	
	Utils.Alfresco.getMessage = function(key, args) {
		if (!key) {
			throw new Error('IllegalArgumentException! The key has to be a valid non-null and non-empty string');
		}
		return ('undefined' == typeof msg ? messages : msg).get(key, args || []);
	};

	Utils.Alfresco.getCompanyHome = function() {
		
		if ('undefined' == typeof companyhome) {
			var companyhome = search.xpathSearch('/app:company_home')[0];
		}		
		
		if (null != companyhome) return companyhome;
		
		throw new Error('IllegalStateException! Cannot retrieve the CompanyHome node');
		
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
	
	Utils.Alfresco.defaultCreateFolderHandler = function(parentNode, childName, fileName) {
		
		var 
			colonIndex = childName.indexOf(':'),
			prefixedName = colonIndex >= 0  ? childName : null
        ;
			
		fileName = fileName || ( colonIndex >= 0  ? childName.substring(colonIndex + 1) : childName );
		return parentNode.createNode(fileName, 'cm:folder', null, 'cm:contains', prefixedName);
		
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
		
		createFolderHandler = createFolderHandler || Utils.Alfresco.defaultCreateFolderHandler;
			
		Utils.forEach(segments, function(segment) {
			
			var 
                prefixedName = segment.indexOf(':') >= 0  ? segment : null,
                fileName = prefixedName  ? segment.split(':')[1] : segment,
                  
                childNode = prefixedName
                  ? currentNode.childrenByXPath(prefixedName)[0] 
                  : currentNode.childByNamePath(fileName)
			;			
			if (null == childNode) {
				childNode = createFolderHandler(currentNode, prefixedName || fileName);
			}
			
			currentNode = childNode;
		});
		
		return currentNode;
	}
	
	Utils.Alfresco.getTitleOrName = function(node) {
		
		if (null == node) return '';
		return node.properties['cm:title'] || node.name || '';
		
	};
	
	Utils.Alfresco.getTitleAndName = function(node, separator /* = '|' */) {
		
		if (null == node) return '';
		
		var 
			name = node.name,
			title = node.properties['cm:title'] || name
		;
		
		return title + ( separator || '|' ) + name;
		
	};
	

	Utils.Alfresco.getGroupNode = function(group) {
		
		if (Utils.isString(group)) {
			group = Utils.asString(group);
			if (!Utils.String.startsWith(group, 'GROUP_') ){
				group = 'GROUP_' + group;
			}
		}
		
		return people.getGroup(group);
		
	};

	/**
	 * @private
	 */
    function isPersonScriptNode(person) {
    	if (null == person) return false;
    	return ('cm:person' === Utils.asString(person.typeShort));
    }	
	
    Utils.Alfresco.getPersonScriptNode = function(person) {
    	
    	if (isPersonScriptNode(person)) return person;
    	
    	if (Utils.isString(person)) {
    		
    		return people.getPerson(Utils.asString(person)); // may be null
    		
    	} 
    	else {
    		
    		throw new Error('IllegalArgumentException! The provided person argument is not of a recognized type');
    		
    	}
    	
    }
    
    Utils.Alfresco.isPersonDisabled = function(person) {
    	
    	person = Utils.Alfresco.getPersonScriptNode(person);
    	return person.hasAspect('cm:personDisabled');

    }
    
    Utils.Alfresco.isAdmin = function(person) {
    	
    	var personNode = Utils.Alfresco.getPersonScriptNode(person);
    	return people.isAdmin(person);
    	
    }
    
    Utils.Alfresco.getPersonEmail = function(person)  {
    	
    	if (null == person) return null;
    	
    	var personNode = Utils.Alfresco.getPersonScriptNode(person);
    	if (null == personNode) return null;
    	
    	return Utils.asString(personNode.properties['cm:email']) || null;
    	
    }
    
    Utils.Alfresco.getPersonDisplayName = function(person, displayUserName) {
    	
    	var
    		personNode = Utils.Alfresco.getPersonScriptNode(person)
    	;
    	
    	if (null == personNode) {
    		return Utils.isString(person) ? person : '(invalid person)';
    	}
    	
    	return Utils.Alfresco.getDisplayName(
    		personNode.properties.firstName,
    		personNode.properties.lastName,
    		true === displayUserName ? personNode.properties.userName : ''
    	);
    	
    }
    
    Utils.Alfresco.getDisplayName = function(firstName, lastName, userName) {
    	
    	firstName = Utils.String.trim(Utils.asString(firstName)) || '';
    	lastName  = Utils.String.trim(Utils.asString(lastName)) || '';
    	userName = Utils.String.trim(Utils.asString(userName)) || '';
    	
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
    	if (Utils.isString(person)) return Utils.asString(person) || ''; 
    	
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
    
    Utils.Alfresco.isAuthenticated = function() {
    	return null != session.ticket;
    }
    
    Utils.Alfresco.getCurrentUserName = function() {
    	if (!Utils.Alfresco.isAuthenticated()) return null;
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
    
    Utils.Alfresco.getPermissionFromString = function(permission) {
    	
		var
		
			splitPermission = Utils.asString(permission || '').split(';'),
			
			result = {
				accessStatus : splitPermission[0] || '',
				authority : splitPermission[1] || '',
				role : splitPermission[2] || ''
			}
		
		;
		
		if (null != splitPermission[4]) {
			result.direct = 'DIRECT' == splitPermission[4];
		}
		
		return result;
    	
    }

    Utils.Alfresco.getAllowedPermissionsForAuthority = function(node, authority, directOnly /* boolean */) {
    	
    	return Utils.Array.map(true === directOnly ? node.getDirectPermissions() : node.getPermissions(), function(permission) {
    		
    		permission = Utils.Alfresco.getPermissionFromString(permission);
    		
    		if ('ALLOWED' != permission.accessStatus) return;
    		if (Utils.isFunction(authority) && !authority(permission.authority)) return;
    		if (authority != permission.authority) return;
    		
    		return permission;
    		
    	});
    	
    }

	
    Utils.Alfresco.hasPermission = function(/* ScriptNode */ node, /* String */ permission /* = 'Read' */, /* String */ userName /* = null */) {
    	
    	if (null == node) return true;
    	permission = permission || 'Read';
    	
    	if (null == userName || userName == Utils.Alfresco.getFullyAuthenticatedUserName()) {
    		return node.hasPermission(permission);
    	}
    	
    	return bdNodeUtils.hasPermission(node, permission, userName); // will check that you have right permissions
    	
    }
    
	/**
	 * Get a site whether the provided parameter is a string, a site node,
	 * or a site object (the one returned by the site-service
	 */
	Utils.Alfresco.getSiteNode = function(site) {
			
		if (Utils.Alfresco.isScriptNode(site)) {
			return site;
		}
		if (Utils.isString(site)) {
			site = siteService.getSite(Utils.asString(site));
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
	
	Utils.Alfresco.getEnclosingSiteName = function(node, useCache /* = false */) {
		
		if (null == node) return null;
		
		if ('undefined' != typeof bdNodeUtils) {
			return bdNodeUtils.getSiteShortName(node, true === useCache);
		}
		
		return node.getSiteShortName();
		
	}
	
	Utils.Alfresco.getEnclosingSiteNode = function(node) {
		
		var 
			siteShortName = Utils.Alfresco.getEnclosingSiteName(node),
			site = siteShortName ? siteService.getSite(siteShortName) : null
		;
		
		if (null == site) return null; // non-existing or non-accessible
		return site.getNode();
		
	}

	Utils.Alfresco.getSiteTitle = function(site) {
		
		var siteNode = Utils.Alfresco.getSiteNode(site);
		if (!siteNode) return '';
		
		return siteNode.properties['cm:title'];
		
	}
	
	Utils.Alfresco.toPrefixQName = function(propertyQName) {
		
		var
			companyhome_ = Utils.Alfresco.getCompanyHome(),
			namespacePrefixResolver
		;
		
		if (null == companyhome_) throw new Error("Cannot define a namespace prefix-resolver");
		
		namespacePrefixResolver = companyhome_.getNamespacePrefixResolver();
		
		if (Utils.isString(propertyQName)) {
			
			if ('undefined' != typeof Packages) {
				propertyQName = Packages.org.alfresco.service.namespace.QName.createQName(propertyQName);
			}
			else {
				throw new Error('IllegalArgumentException! The provided argument has to be of type QName');
			}
			
		}
		
		return Utils.asString(propertyQName.toPrefixString(namespacePrefixResolver));
		
	}

	function defaultNameGeneratorFunction(namePrefix, count, context) {
		return namePrefix + "_" + Math.floor(Math.random() * 1000);
	}
	
	/**
	 * Returns a unique name that can be used to create a
	 * child of the given parentNode.
	 * 
	 * Note that their may be several parent-nodes checked in the same 
	 * time
	 *
	 */
	Utils.Alfresco.getUniqueChildName = function(parentNodes, prefix, nameGeneratorFunction) {
		
		var 
			namePrefix = prefix, 
			name = namePrefix,
			count = 0,
			context = {}
		;
		
		if (!Utils.isFunction(nameGeneratorFunction)) {
			nameGeneratorFunction = defaultNameGeneratorFunction;
		}
		
		parentNodes = [].concat(parentNodes);
		
		function childExists(name) {
			return Utils.Array.exists(parentNodes, function(parentNode) {
				if (null == parentNode) return false;
				return null != parentNode.childByNamePath(name);
			});			
		}

		while (childExists(name) && count < 100) {
			name = nameGeneratorFunction(namePrefix, count, context);
			++count;
		}
		
		return name;
		
	}
	
	
	Utils.Alfresco.CopyPropertyUtils = {
			
		executeCopy : function(source, target, mapOperations) {
			
			var me = this;
			
			Utils.forEach(mapOperations, function(mapOperation) {
				
				if (null == mapOperation) return;
				mapOperation.call(me, source, target);
				
			});
			
			target.save();
			
		},
		
		getDirectMapOperation : function(sourceProperty, targetProperty) {
			
			if (null == sourceProperty || null == targetProperty) return null;
			
			return function(source, target, overrideExisting) {
				
				var 
					sourceValue = source.properties[sourceProperty],
					targetValue = target.properties[targetProperty]
				;
				
				if (null == sourceValue) return;
				if (overrideExisting !== true && Utils.asString(targetValue).length > 0) return; // don't erase existing values
				
				target.properties[targetProperty] = sourceValue;

			};
			
		},
		
		getJoinMapOperation : function(sourceProperties, targetProperty, separator) {
			
			if (null == targetProperty) return null;
			
			return function(source, target, overrideExisting) {
				
				var targetValue = target.properties[targetProperty];
				if (overrideExisting !== true && Utils.asString(targetValue).length > 0) return; // don't erase existing values
				
				var 
					sourceValues = Utils.map(sourceProperties, function(sourceProperty) {
					
						var sourceValue = source.properties[sourceProperty];
						if (null == sourceValue) return; // ignore
						
						return Utils.asString(sourceValue);
						
					}),
					
					joinedValue = Utils.String.join(sourceValues, separator) 
				;
				
				if (joinedValue.length == 0) return; // ignore empty strings
				target.properties[targetProperty] = joinedValue;
				
			};
			
		}		
			
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
			
			if (Utils.isFunction(newInstance._init)) {
				newInstance._init.apply(newInstance, initArgs || []);
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
	
	Utils.Object.keys = Utils.keys;
	Utils.Object.values = function(obj) {
		
		return Utils.Array.map(Utils.Object.keys(obj), function(key) {
			return obj[key];
		});
		
	}
	
	function ConstantsClassAdapter(modelName) {
		
		if ('undefined' == typeof Packages) {
			Utils.Error.raise('IllegalStateException! Cannot find the Packages object provided by Alfresco to create the Adapter');
		}
		
		this.javaModel = Packages[modelName];
		
		// weak testing !
		if ('function' != typeof this.javaModel) {
			Utils.Error.raise("IllegalStateException! The fully-qualified name '" + modelName + "' does not target a valid Java Class or Interface");
		}
		
		this.get = function(value) {
			return Utils.asString(this.javaModel[value]);
		}
		
		this.buildJavascriptObject = function() {
			
			var
				me = this,
				result = {}
			;
			Utils.Array.forEach(Utils.keys(me.javaModel), function(propertyName) {
				result[propertyName] = me.get(propertyName);
			});
			return result;
			
		}
		
	}
	
	Utils.Object.getJavaConstantsClassAdapter = function(modelName) {
		
		return new ConstantsClassAdapter(modelName);
		
	}
	
	Utils.Object.getConstantsObject = function(modelName) {
		
		var adapter = Utils.Object.getJavaConstantsClassAdapter(modelName);
		return adapter.buildJavascriptObject();
		
	}
	
	
	
	Utils.Error = {
		
		raise : function(message, exception) {
			throw new Error(message);
		}
		
	};
	
	Utils.Debug = {
		
		breakWithException : function() {
			
			try {
				throw new Error('Break');
			} catch(e) {
				// ignore
				logger.debug('BreakPoint -- TO BE REMOVED');
			}
			
		}	
		
	}
	
	Utils.Cache = {
		
		_cacheSize : 10,
		
		create : function(cacheSize, name) {
			
			var newCache = Utils.Object.create(this, {
				_cacheSize : cacheSize,
				_name : name || '',
				_cache : {},
				_timeLine : []
			});
			
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

	Utils.JSON = {};
	
	Utils.JSON.parse = function (string, failSilently) {
		
		if (string.indexOf('function') > 0 || string.indexOf('()') > 0) {
			throw new Error('IllegalStateException! The provided string cannot contain any function definition or call.');
		}
		
		try {
			return eval('x = ' + string);
		} catch (e) {
			if (failSilently) return '';
			else throw e;
		}
		
	};
	
	/**
	 * User Alfresco jsonUtils.toObject helper function
	 * This function however does not map correctly Arrays. This is the reason of this helper function
	 */
	Utils.JSON.toObject = function(string) {
		
		if ('undefined' == typeof jsonUtils) {
			throw new Error('IllegalStateException! The jsonUtils helper does not exist.');
		}
		
		var object = jsonUtils.toObject(string);
		if (null == object) return null;
		
		fixArrays(object);
		
		return object;
		
		
		function fixArrays(object) {
			
			var property, value;
			
			for (property in object) {
				
				value = object[property];
				if (null == value || null == value.getClass) continue;
				if ('class org.json.simple.JSONArray' != Utils.asString(value.getClass())) continue;
				
				object[property] = Utils.map(Utils.toArray(value), function(arrayElement) {
					return fixArrays(arrayElement);
				});
				
			}
			
			return object;
			
		}
		
	}
    
})();