(function() {	

	
	ClassificationUtils = {
		
		ROOT_CATEGORY_NAME : "Gestion de courrier",
		
		getYammaRootCategoryNode : function() {
			
			if ('undefined' == typeof person) return null; // unauthenticated => search will fail
			
			var matchingRootCategories = 
				search.luceneSearch(
					'+TYPE:"cm:category" ' + Utils.Alfresco.getLuceneAttributeFilter('cm:name', this.ROOT_CATEGORY_NAME)
				) || [];
					
			return matchingRootCategories[0]; // may be null
			
		},
		
		getMainCategories : function() {
			
			var yammaRootCategory = this.getYammaRootCategoryNode();
			if (null == yammaRootCategory) return [];
			
			return yammaRootCategory.childrenByXPath('*[subtypeOf("cm:category")]') || [];
			
		}
		
		
	};

})();
