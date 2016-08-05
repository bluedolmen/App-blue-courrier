(function() {	

	
	var AlfrescoClassificationUtils = Utils.ns('Utils.Alfresco.Classification');
	
	AlfrescoClassificationUtils = ClassificationUtils = {
		
//		ROOT_CATEGORY_NAME : "BlueCourrier",
//		
//		getYammaRootCategoryNode : function() {
//			
//			if (undefined === this._cachedRootCategory) {
//				
//				if ('undefined' == typeof person) return null; // unauthenticated => search will fail
//				
//				var matchingRootCategories = 
//					search.luceneSearch(
//						'+TYPE:"cm:category" +' + Utils.Alfresco.getLuceneAttributeFilter('cm:name', this.ROOT_CATEGORY_NAME)
//					) || [null];
//				
//				this._cachedRootCategory = matchingRootCategories[0]; // may be null 
//			}
//			
//					
//			return this._cachedRootCategory;
//			
//		},
//		
//		getMainCategories : function(rootCategoryNode) {
//			
//			rootCategoryNode = rootCategoryNode || ClassificationUtils.getYammaRootCategoryNode(); 
//			if (null == rootCategoryNode) return [];
//			
//			return rootCategoryNode.childrenByXPath('*[subtypeOf("cm:category")]') || [];
//			
//		},
			
		/**
		 * Returns the categories of a node, *NOT* the children categories of the given node
		 */
		getNodeCategories : function(node) {
			
			if (null == node) return [];
			return node.properties['cm:categories'];
			
		},
			
		getRootCategoryNode : function() {
			
			if (undefined === this._cachedRootCategory) {
				
				if ('undefined' == typeof person) return null; // unauthenticated => search will fail
				
				var matchingRootCategories = 
					search.luceneSearch(
						'+PATH:"/cm:categoryRoot/cm:generalclassifiable"'
					) || [null];
				
				this._cachedRootCategory = matchingRootCategories[0]; // may be null
				
			}
					
			return this._cachedRootCategory;
			
		},
		
		getParentCategoryNode : function(categoryNode) {
			
			if (null == categoryNode) {
				throw new Error('IllegalParameterException! The provided node is null');
			}
			
			return (categoryNode.parentAssocs['cm:subcategories'] || [null])[0]; // beware! you may not be allowed to read the node
			
		},
		
		getCategoryAncestors : function(categoryNode) {
			
			if (null == categoryNode) {
				throw new Error('IllegalArgumentException! The provided category-node has to be a valid node');
			}
			
			var 
				path = [],
				rootCategoryNode = ClassificationUtils.getRootCategoryNode()
			;
			
			if (null == rootCategoryNode) return [];
			
			while (true) {
				
				categoryNode = ClassificationUtils.getParentCategoryNode(categoryNode);
				if (null == categoryNode) return []; // we should be able to find the root node (or we are on)
				if (!categoryNode.hasPermission('Read')) break;
				if (rootCategoryNode.equals(categoryNode)) break;
				
				path.push(categoryNode);
				
			}
			
			return path;
			
		}

		
		
	};

})();
