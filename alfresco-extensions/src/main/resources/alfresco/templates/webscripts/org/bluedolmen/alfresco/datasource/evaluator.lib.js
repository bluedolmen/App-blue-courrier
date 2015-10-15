(function() {
	
	Evaluator = function(datasourceDefinition, skipNullNodes /* = true */) {	
		
		if (null == datasourceDefinition) {
			throw new Error("A valid datasource-definition has to be provided!");
		}
		
		var fieldsDefinition = datasourceDefinition.getFields();
		if (undefined === fieldsDefinition || fieldsDefinition.length == 0) {
			throw new Error("The provided view-definition is not valid (no fields defined)");
		}
		
		this.datasourceDefinition = datasourceDefinition;
		this.skipNullNodes = false !== skipNullNodes; 
		
	};
	
	Evaluator.prototype.evaluateList = function(nodeList) {
		
		var 
			me = this,
			items = [],
			meta = nodeList.meta
		;

		// MAIN LOGIC
		Utils.forEach(nodeList,
			function(node) {
			
				if (null == node && me.skipNullNodes) return;
				
				var values = me.datasourceDefinition.evaluateNode(node, meta);
				
				if (Utils.isArray(values)) {
					items.push.apply(items, values);				
				} 
				else {
					items.push(values);
				}
				
			}
		);
		
		return items;
		
	};	
	
})();

