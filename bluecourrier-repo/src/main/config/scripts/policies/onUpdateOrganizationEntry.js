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
			organizationName = Utils.asString(afterProperties[DirectoryModel.ORGANIZATION_NAME_PROPNAME]),
			addressPostcode = Utils.asString(afterProperties[DirectoryModel.ADDRESS_POSTCODE_PROPNAME]),
			addressCity = Utils.asString(afterProperties[DirectoryModel.ADDRESS_CITY_PROPNAME]),
			
			name = organizationName,
			title = name
		;
		
		if (null != addressPostcode || null != addressCity) {
			
			name += ' ' + addressPostcode + ' ' +  addressCity;  
				
			title += ' ' + Utils.String.join(Utils.clear(
				['(', addressPostcode, addressCity, ')']
			), ' ');  
			
		}
		
		documentNode.properties['cm:name'] = Utils.String.trim(name);
		documentNode.properties['cm:title'] = title;
		documentNode.save();
			
	}
	
	
})();
