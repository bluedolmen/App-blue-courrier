(function() {	

	DatalistUtils = {
			
		DATALIST_XPATH_LOCATION : null,
		PROPERTY_NAME : null,
		
		getDatalistContainer : function() {
			
			return (search.xpathSearch(this.DATALIST_XPATH_LOCATION)[0] || null);
			
		},
		
		hasDueDateSet : function(documentNode) {
			
			DocumentUtils.checkDocument(documentNode);
			return null != documentNode.properties[this.PROPERTY_NAME];
			
		},
		
		getItemNode : function(value) {
			
			var datalistContainer;
			
			if (null == value) return null;
			
			if (Utils.Alfresco.isNodeRef(value)) {
				return search.findNode(value);
			}
			
			datalistContainer = this.getDatalistContainer();
			if (null == datalistContainer) return null;
			
			return datalistContainer.childByNamePath(value); // may be null
			
		},
		
		getNodeCurrentValue : function(node) {
			
			var currentValue = Utils.asString(node.properties[this.PROPERTY_NAME]) || null;
			if (!Utils.Alfresco.isNodeRef(currentValue)) return currentValue;
			
			node = this.getItemNode(currentValue);
			if (null == node) return currentValue;
			
			return node.name;
			
		},
		
		isSet : function(node) {
			
			if (null == node) {
				throw new Error('NullPointerException! Not a valid node');
			}
			
			return null != node.properties[this.PROPERTY_NAME];
			
		}
		
	};

})();
