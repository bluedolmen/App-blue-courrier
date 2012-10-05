///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/common/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/utils/utils.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/repository/forms/pickerresults.lib.js">
///<import resource="classpath:/alfresco/extension/templates/webscripts/org/alfresco/repository/forms/treenode.lib.js">

( function() {
	
	var 
		searchTerm = null,		
		maxResults = 15,
		rootPath = '',
		lastSegment = 'General',
		pathSegments = [lastSegment],
		rootDepth = 0,
		categories = []
	;

	// MAIN LOGIC
	
	Common.securedExec(function() {
		var parseArgs = new ParseArgs('searchTerm', { name : 'size', defaultValue : '15' });
		
		searchTerm = parseArgs['searchTerm'];
		maxResults = parseInt(parseArgs['size'], 10);
		rootPath = url.templateArgs["rootPath"] || '';
		
		pathSegments = rootPath.split('/');
		lastSegment = pathSegments[pathSegments.length - 1];
		
		main();
		setModel();
		
	});

	function main() {
		
		setCategories();
		
	}
	
	// end
	

	function setCategories() {
		
		var 
			queryDef = {
				query : getLuceneCategoryQuery(),
				language : 'lucene',
				sort : [
					{
						column : 'cm:name',
						ascending : true
					}
				],
				page : {
					maxItems : maxResults
				}
			}
		;
		
		categories = search.query(queryDef);
		
	}

	function getLuceneCategoryQuery() {
		
		var encodedRootPath = getEncodedRootPath();
		
		return ( 
			'PATH:"/cm:generalclassifiable' 
			+ ( encodedRootPath ? '/' + encodedRootPath : '') 
			+ '//*"'
		);
		
	}
	
	function getEncodedRootPath() {
		
		if (!rootPath) return rootPath;
		
		return Utils.reduce(pathSegments,
			function(segment, aggregate, isLast) {
				return aggregate + 'cm:' + search.ISO9075Encode(rootPath) + (isLast ? '' : '/');
			},
			'' /* initial value */
		);
		
	}
	
	function getCategoryPath (categoryNode) {
		
		// This function may use the displayPath with the rootDepth instead => performance evaluation?
		var path = '';
		for (var category = categoryNode ; category && Utils.asString(category.name) != lastSegment; category = category.parent) {
			path = category.name + (path ? ' > ' + path : '');
		}
		
		return (path ? path : '');
		
	}
	
	function setModel() {
		
		var
			results = Utils.map(categories, function(category) {
				return {
					item : category,
					title : getCategoryPath(category),
					selectable : true
				}
			}),
			
			filteredResults = searchTerm ?  
				Utils.filter(results, function(result) {
					return result.title.indexOf(searchTerm) >= 0;
				})
				: results
		;
		
		model.results = filteredResults;
	}
	
})();
