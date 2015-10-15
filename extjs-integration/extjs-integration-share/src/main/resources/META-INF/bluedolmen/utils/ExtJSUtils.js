Ext.define('Bluedolmen.utils.ExtJSUtils', {
	
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
		
	},
	
	/**
	 * @see http://www.w3.org/TR/html5/number-state.html#file-upload-state
	 * @param {} path
	 * @return {}
	 */
	extractUploadFieldFilename : function(path) {
		if (path.substr(0, 12) == "C:\\fakepath\\")
			return path.substr(12); // modern browser
		var x;
		x = path.lastIndexOf('/');
		if (x >= 0) // Unix-based path
			return path.substr(x + 1);
		x = path.lastIndexOf('\\');
		if (x >= 0) // Windows-based path
			return path.substr(x + 1);
		return path; // just the filename
	}
	
	
});