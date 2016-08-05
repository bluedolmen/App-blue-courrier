///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/directory-utils.js">

(function() {

	// CHECKINGS
	
	var
		bargs = behaviour.getArgs(),
		documentNode = bargs[0],
		afterProperties = bargs[2]
	;
	
	// MAIN
	
	main();
	
	function main() {
		
		var
			personFirstName = Utils.asString(afterProperties[DirectoryModel.PERSON_FIRST_NAME_PROPNAME]),
			personLastName = Utils.asString(afterProperties[DirectoryModel.PERSON_LAST_NAME_PROPNAME]),
			addressPostcode = Utils.asString(afterProperties[DirectoryModel.ADDRESS_POSTCODE_PROPNAME]),
			addressCity = Utils.asString(afterProperties[DirectoryModel.ADDRESS_CITY_PROPNAME]),
			userName = Utils.asString(afterProperties[DirectoryModel.PERSON_ENTRY_USER_NAME_PROPNAME]),
			
			name = personFirstName + ' ' + personLastName,
			title = name
		;
		
		if (userName) {
			name += ' ' + userName;
		}
		
		if (null != addressPostcode || null != addressCity) {
			
			name += ' ' + addressPostcode + ' ' +  addressCity;
				
			title += ' ' + Utils.String.join(Utils.clear(
				['(', addressPostcode, addressCity, ')']
			), ' ');  
			
		}
		
		name = Utils.String.trim(name);
		if (!name) return;
		
		name = getUniqueName(name);
		
		documentNode.properties['cm:name'] = name;
		documentNode.properties['cm:title'] = title;
		documentNode.save();
			
	}
	
	// Returns a unique name considering the duplicates of the given basename
	function getUniqueName(baseName) {

		var
			parentNode = documentNode.parent,
			name = baseName,
			i = 0
		;
		
		// Look for any duplicate child name
		while (null != parentNode.childByNamePath(name)) {
			name = baseName + ' ' + ++i;
		}
		
		return name;
		
	}
	
	
})();
