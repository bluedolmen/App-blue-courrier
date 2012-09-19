Ext.define('Bluexml.utils.ExtJSUtils', {
	
	/**
	 * This method removes the namespace prefix of Alfresco types.
	 * 
	 * This may be used to use an Ext.XTemplate with an out-of-the box
	 * record data result.
	 * 
	 * @param {Object/String} object
	 * @returns {Object/String}
	 */
	clearNamespacePrefix : function(object) {
		
		function clearStringPrefix(value) {
			var colonIndex = value.indexOf(':');
			if (colonIndex > 0) return value.substr(colonIndex);
			
			return value;
		}
		
		if ('string' == typeof object) return clearStringPrefix(object);
		
		var result = {};
		for (var key in value) {
			var clearedKey = clearStringPrefix(key);
			result[clearedKey] = object[key];
		}
		return result;
		
	}
	
});