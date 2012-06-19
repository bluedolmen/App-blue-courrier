(function() {
	
	Evaluator = function(datasourceDefinition) {	
		
		if (null == datasourceDefinition) {
			throw new Error("A valid datasource-definition has to be provided!");
		}
		
		var fieldsDefinition = datasourceDefinition.getFields();
		if (undefined === fieldsDefinition || fieldsDefinition.length == 0) {
			throw new Error("The provided view-definition is not valid (no fields defined)");
		}
		
		this.datasourceDefinition = datasourceDefinition;
		
	};
	
	Evaluator.prototype.evaluateList = function(nodeList) {
		
		var me = this;
		var items = [];

		// MAIN LOGIC
		Utils.forEach(nodeList,
			function(node) {
				var values = me.datasourceDefinition.evaluateNode(node);
				if (Utils.isArray(values)) {
					items.push.apply(items, values);				
				} else {
					items.push(values);
				}
			}
		);

		
		
		return items;
		
	};	
	
})();

