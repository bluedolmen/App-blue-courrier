(function() {
	
	/**
	 * A derivative from Evaluator which performs aggregation of values on a
	 * list of nodes.
	 */
	Aggregator = function(datasourceDefinition) {
		
		if (null == datasourceDefinition) {
			throw new Error("A valid datasource-definition has to be provided!");
		}
		
		this.fieldsDefinition = datasourceDefinition.getFields();
		if (undefined === this.fieldsDefinition || 0 == this.fieldsDefinition.length) {
			throw new Error("The provided view-definition is not valid (no fields defined)");
		}
		
		this.groupByFieldId = datasourceDefinition.getSearchAdditional().groupBy;
		this.compareFunction = datasourceDefinition.getSearchAdditional().compareFunction || defaultCompareFunction;

		
		this.datasourceDefinition = datasourceDefinition;
		this.delegatedDatasource = datasourceDefinition.getDelegated();
		if (null == this.delegatedDatasource) {
			throw new Error("The provided datasource does not define a delegated datasource as expected for an aggregation");
		}
		
		function defaultCompareFunction(left, right) {
			return left == right ? 0 : -1;
		}
		
	};
	
	Aggregator.prototype.evaluateList = function(nodeList) {
		
		var me = this;
		if (!nodeList || 0 == nodeList.length) return []; // no need to go further
		
		var items = [];

		// Variables for helper function
		var lastAggregateValue = null;
		var aggregator = {}; // reinitialized at each group-value change

		// MAIN LOGIC
		Utils.forEach(nodeList,
			function(node) {
				var values = me.delegatedDatasource.evaluateNode(node);
				aggregate(values);				
			}
		);
		aggregate({}, true /* finalize */);
		
		return items;
		
		/*
		 * HELPER INNER FUNCTION TO COMPUTE AGGREGATION
		 * TODO : Maybe it should be delegated to datasource definition in a future refactoring ?...
		 */
		
		function aggregate(values, finalize) {
			
			var currentAggregateValue = values[me.groupByFieldId];
			var initialize = (null === lastAggregateValue);
			var hasValueChanged = !initialize && !finalize && (me.compareFunction(currentAggregateValue, lastAggregateValue) != 0);
			var currentRun = {};
			
			if (hasValueChanged || finalize) {
				
				Utils.forEach(me.fieldsDefinition,
					function(field) {							
						var fieldName = field.getName();
						currentRun[fieldName] = field.evaluate.call(aggregator, lastAggregateValue, 'finalize');
					}
				);
				
				if (undefined === currentRun[me.groupByFieldId]) {
					// Define the default value of the field if not overridden by an evaluate function...
					currentRun[me.groupByFieldId] = lastAggregateValue;
				}
				items.push(currentRun);
				if (finalize) return; // no need to go further
				
				aggregator = {};
			}

			Utils.forEach(me.fieldsDefinition,
			
				function(field) {
					
					if (hasValueChanged || initialize) {
						field.evaluate.call(aggregator, currentAggregateValue, 'initialize');
					}
					
					field.evaluate.call(aggregator, currentAggregateValue, 'compute', values);
					
				}
				
			);
			
			if (hasValueChanged || initialize) {
				lastAggregateValue = currentAggregateValue;
			}
		}
		
	};	
	
})();

