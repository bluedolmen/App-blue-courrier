///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">

(function() {

	var 
		filter = args['filter'],
		maxItems=args['maxItems'],
		sortAsc = true
	;
	
	searchForGroups();
	searchForPersons();

	function searchForGroups () {
		
		var 
			shortNameFilter = '*' + filter + '*' || '',
			paging = utils.createPaging(args),
			sortBy = "displayName"
		;

	   // Get the groups
	   model.groups = groups.getGroupsInZone(shortNameFilter, "APP.DEFAULT" /* zone */, paging, sortBy, sortAsc);
	   model.paging = paging;
	   
	}

	function searchForPersons() {
		
		var sortBy = args["sortBy"];

		// Get the collection of people
		model.peoplelist = people.getPeople(filter, null != maxItems ? parseInt(maxItems) : 0, sortBy, sortAsc);
		
	}
	
})();
