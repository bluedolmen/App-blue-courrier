/**
 * Document List Component: category node 
 * (bpajot) This is an updated version of
 * the existing webscript which provide direct access with a nodeRef
 * TODO: Rewrite a clean and robust version of this webscript
 */

(function() {

	model.categorynode = getCategoryNode();

	/* Create collection of categories for the given path */
	function getCategoryNode() {
		
		try {
			
			var 
				items = new Array(),
				hasSubfolders = true,
				evalChildFolders = args["children"] !== "false",
				
				catAspect = (args["aspect"] != null) ? args["aspect"] : "cm:generalclassifiable",
				nodeRef = url.templateArgs.store_type + "://" + url.templateArgs.store_id + "/" + url.templateArgs.id,
				path = url.templateArgs.path,
				
				rootCategories,
				rootNode, parent, categoryResults,
				queryPath
			;
				
			if ('alfresco://category/root' == nodeRef) {
				
				rootCategories = classification.getRootCategories(catAspect);
				if (rootCategories != null && rootCategories.length > 0) {
					rootNode = rootCategories[0].parent;
				}
				
		         if (path == null) {
		        	 
		            categoryResults = classification.getRootCategories(catAspect);
		            
		         }
		         else {
		        	 
		            queryPath = "/" + catAspect + "/" + encodePath(path);
		            categoryResults = search.luceneSearch("+PATH:\"" + queryPath + "/*\" -PATH:\"" + queryPath + "/member\"");
		            
		         }
		         
			}
			else {
				
				rootNode = search.findNode(nodeRef);
				categoryResults = rootNode.children;
				
			}
			
			for each (item in categoryResults) {
				
				if (evalChildFolders) {
					
	               hasSubfolders = item.children.length > 0;
	               
	            }

	            items.push({
	            	
	               node: item,
	               hasSubfolders: hasSubfolders
	               
	            });
	            
			}
	   
			items.sort(sortByName);
			
			return ({
				items: items
			});
			
		}
		catch(e) {
			
			status.setCode(status.STATUS_INTERNAL_SERVER_ERROR, e.toString());
			return;
			
		}
		
	}

	/* Get the path as an ISO9075 encoded path */
	function encodePath(path) {
		
	   var parts = path.split("/"), i, len;
	   for (var i = 0, len = parts.length; i < len; i++) {
		   parts[i] = "cm:" + search.ISO9075Encode(parts[i]);
	   }
	   
	   return parts.join("/");
	   
	}

	/* Sort the results by case-insensitive name */
	function sortByName(a, b) {
		
	   return (b.node.name.toLowerCase() > a.node.name.toLowerCase() ? -1 : 1);
	   
	}
	
})();
