(function() {	

	DeliveryModelsUtils = {
			
		DATALIST_XPATH_LOCATION : '/app:company_home/st:sites/cm:' + YammaUtils.ConfigSite.name + '/cm:dataLists/cm:delivery-models',
		
		getDatalistContainer : function() {
			
			return (search.xpathSearch(this.DATALIST_XPATH_LOCATION)[0] || null);
			
		},
		
		getDeliveryModelNode : function(value) {
			
			if (null == value) return null;
			
			var datalistContainer = this.getDatalistContainer();
			if (null == datalistContainer) return null;
			
			return datalistContainer.childByNamePath(value); // may be null
			
		},
		
		/**
		 * Matches on ALL the categories
		 */
		getBestMatchingDeliveryModelForNode : function(node) {
			
			var 
				datalistContainer = this.getDatalistContainer(),
				categories = node.properties['cm:categories']
			;
			
			if (null == datalistContainer) return null;
			
			return Utils.Array.first(datalistContainer.children, function(deliveryModelItem) {
				
				var dmiCategories = deliveryModelItem.properties['cm:categories'];
				if (Utils.Array.isEmpty(dmiCategories)) return false; // do not consider empty categories
				
				return Utils.Array.every(dmiCategories, function(dmiCategory) {
					return -1 != Utils.Array.indexOf(
						categories, 
						function(category) { 
							return Utils.javaEqualsFunction(dmiCategory, category); 
						}
					);
				});
				
			});

		}
		
		
	};

})();
