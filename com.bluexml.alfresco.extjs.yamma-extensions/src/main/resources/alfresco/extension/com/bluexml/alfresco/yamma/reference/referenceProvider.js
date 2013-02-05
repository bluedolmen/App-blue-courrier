///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">

function main() {

	var 
	
		now = new Date(),
		month = now.getMonth() + 1, // month is zero-based
		year = now.getFullYear(),
		day = now.getDate(),
		
		uniqueId = idprovider.getNext(),
		
		reference = Utils.String.format(
			"{0}{1}{2}-{3}",
			year,
			Utils.String.leftPad(month, 2, '0'),
			Utils.String.leftPad(day, 2, '0'),
			uniqueId
		);
		
	;	
	
	return reference;
	
}

main();
