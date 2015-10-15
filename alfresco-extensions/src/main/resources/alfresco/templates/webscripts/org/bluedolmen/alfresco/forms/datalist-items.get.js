///<import resource="classpath:/alfresco/extension/bluedolmen/utils/utils.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/common.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/alfresco/actions/parseargs.lib.js">

(function() {

	var
		typeName = null,
		siteName = null,
		items = [],
		getValue = function(item) {return Utils.asString(item.nodeRef); };
	;
	
	// MAIN LOGIC
	
	Common.securedExec(function() {
		
		var 
			parseArgs = new ParseArgs({ name : 'datalist', mandatory : true}, { name : 'site', mandatory : false}, 'valueProperty'),
			valueProperty
		;
		
		typeName = parseArgs['datalist'];
		if (-1 == typeName.indexOf(':')) {
			typeName = 'cm:' + typeName;
		}
		
		siteName = parseArgs['site'] || '*';
		
		valueProperty = Utils.asString(parseArgs['valueProperty']);
		if (valueProperty) {
			getValue = function(item) {return Utils.asString(item.properties[valueProperty])};
		}
		
		main();
		
	});
	
	function main() {

		items = getItems();
		setModel();
		
	}	
	
	function getItems() {
		
		var 
			query = '/app:company_home/st:sites/cm:' + siteName + '/cm:dataLists',
			nodes = search.xpathSearch(query) || [null],
			dataLists = nodes[0] // Keep only the first matching site
		;
		
		if (null == dataLists) return [];
		
		if ('*' == siteName) {
			siteName = Utils.Alfresco.getEnclosingSiteName(dataLists);
		}

		return dataLists.childrenByXPath('*[@dl:dataListItemType=\'' + typeName + '\']/*') || [];
		
	}
	
	function setModel() {
		
		model.result = {
			
			typeName : typeName,
			siteName : siteName,
			items : Utils.Array.map(items, function(item) {
				
				return {
					value : getValue(item),
					label : Utils.asString(item.properties['cm:title']) || Utils.asString(item.name) 
				};
				
			})

		}
		
	}
	
})();