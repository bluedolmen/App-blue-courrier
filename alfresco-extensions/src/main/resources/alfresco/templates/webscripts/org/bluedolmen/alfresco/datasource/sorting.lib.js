(function(){

	Sorter = function(datasourceDefinition) {
		if (null == datasourceDefinition) {
			throw new Error("IllegalArgumentException! A valid datasource-definition has to be provided!");
		}

		this.datasourceDefinition = datasourceDefinition;
	};

	/**
	 * ProxiedNode is a private class meant to store a cached value of the
	 * sorted column while performing sort operation.
	 * 
	 * @private
	 */
	Sorter.ProxiedNode = function(node) {
		
		if (node instanceof Sorter.ProxiedNode) return node;
		
		this.proxyNode = node;
		this.cachedValue = {};
		
		return this;
	}
	/**
	 * evaluateFunction : {
	 *    id : string // id of the cache
	 *    fn : function(node) -> Object // function evaluating the node value
	 * }
	 */
	Sorter.ProxiedNode.prototype.evaluate = function(evaluateFunction) {
		var cachedValue = this.cachedValue[evaluateFunction.id];
		
		if (undefined === cachedValue) {
			cachedValue = evaluateFunction.fn(this.proxyNode);
			this.cachedValue = cachedValue; 
		}
		
		return cachedValue;
	}
	
	/**
	 * This helper method wraps the given list of nodes to add an helper method
	 * that provides cached evaluation of the nodes
	 * 
	 * @argument {Node[]} nodes a list of Nodes
	 * @argument {Function} evaluateFunction the function that will be used to
	 *           evaluate the node value
	 * @private
	 */
	function getWrappedNodes(nodes) {
		
		return Utils.map(nodes,
			function(node) {
				return new Sorter.ProxiedNode(node);
			}
		);
		
	};
	
	function getUnwrappedNodes(nodes) {
		
		return Utils.map(nodes,
			function(node) {
				return node.proxyNode;
			}
		);
		
	}

	Sorter.prototype.sort = function(nodes, sortParams) {

		var me = this;
		
		if (null == nodes || !Utils.isArray(nodes)) {
			throw new Error('IllegalArgumentException! A valid list of nodes has to be provided');
		}
		
		if (undefined === sortParams) return nodes; // do nothing
		
		var wrappedNodes = getWrappedNodes(nodes);
		
		sortParams = getOrderedSetFromList(sortParams, 
			function(sortParam){
				return sortParam.column;
			}
		);
		
		// sort by reverse order of the sort-params
		Utils.forEach(sortParams,
			function(sortParam) {
				me.sortOnColumn(wrappedNodes, sortParam.column, 'ASC' == sortParam.dir);
			},
			true // reverse
		);		

		return getUnwrappedNodes(wrappedNodes);
		
	}
	
	Sorter.prototype.sortOnColumn = function(wrappedNodes, columnName, sortAscending) {
		
		var me = this;
		
		if (null == columnName) {
			throw new Error('IllegalArgumentException! The provided column-name is not valid (should be a valid non-null String)');
		}
		
		var fieldDefinition = this.datasourceDefinition.getFieldDefinition(columnName);
		if (null == fieldDefinition) {
			throw new Error("IllegalStateException! Cannot find a valid field-definition for column '" + columnName + "'");
		}
		
		sortAscending = (undefined === sortAscending) ? true : sortAscending; // Default sort-direction to ascending if not defined
		
		
		/*
		 * The compareValueFunction is used to compare to values. The
		 * default behaviour is to compare lexicographically values
		 */
		var compareValueFunction = getCompareFunction(fieldDefinition);

		var evaluateFunction = {
			id : columnName,
			fn : function(node) {
				return me.datasourceDefinition.evaluateNode(node, columnName);
			}
		}

		function compareNodes(nodeA, nodeB) {
			var valueA = nodeA.evaluate(evaluateFunction);
			var valueB = nodeB.evaluate(evaluateFunction);
			
			return (sortAscending ? 1 : -1) * compareValueFunction(valueA, valueB);
		}
		
		wrappedNodes.sort(compareNodes);
		
	}
	
	function getCompareFunction(fieldDefinition) {
		
		var compareValueFunction = fieldDefinition.compareValueFunction;
		if (compareValueFunction) return compareValueFunction;

		var type = fieldDefinition.getType();
		if (undefined === type) return compareStringFunction; 

		switch (type) {
			case 'int':
				return compareIntFunction;
			break;
			
			case 'string':
				return compareStringFunction;
			break;
		}
		
		// Default
		return compareStringFunction;		
	}

	function compareStringFunction(valueA, valueB) {
		return valueA.toString().localeCompare(valueB.toString());
	}	
	
	function compareIntFunction(valueA, valueB) {
		return (valueB || 0) - (valueA || 0);
	}

	/**
	 * This helper function returns a list without duplicates that may exist
	 * w.r.t. the "primary key" obtained through the getId() provided function
	 * that applies on each element of the given list
	 */
	function getOrderedSetFromList(list, getId) {
		
		var result = [];
		
		var existingIds = {};
		// sort by reverse order of the sort-params
		Utils.forEach(list,
			function(element) {
				var id = getId ? getId(element) : element;
				if (existingIds[id]) return;
				
				result.push(element);
				existingIds[id] = true;
			}
		);		
		
		return result;
	}
	
	
	/*
	 * The next following methods are a copy/paste of the previous methods working on a list
	 * of nodes.
	 * TODO: We should refactor all this code to enable a better code reuse !!!
	 */	
	Sorter.prototype.sortValues = function(valuesList, sortParams) {
		
		var me = this;
		
		if (null == valuesList || !Utils.isArray(valuesList)) {
			throw new Error('IllegalArgumentException! A valid list of values has to be provided');
		}
		
		if (undefined === sortParams) return valuesList; // do nothing
		
		sortParams = getOrderedSetFromList(sortParams, 
			function(sortParam){
				return sortParam.column;
			}
		);
		
		// sort by reverse order of the sort-params
		Utils.forEach(sortParams,
			function(sortParam) {
				me.sortValuesOnColumn(valuesList, sortParam.column, sortParam.ascending);
			},
			true // reverse
		);		

	}
	
	Sorter.prototype.sortValuesOnColumn = function(valuesList, columnName, sortAscending) {
		
		if (null == columnName) {
			throw new Error('IllegalArgumentException! The provided column-name is not valid (should be a valid non-null String)');
		}
		
		var fieldDefinition = this.datasourceDefinition.getFieldDefinition(columnName);
		if (null == fieldDefinition) {
			throw new Error("IllegalStateException! Cannot find a valid field-definition for column '" + columnName + "'");
		}
		
		sortAscending = (undefined === sortAscending) ? true : 'ASC' === sortAscending; // Default sort-direction to ascending if not defined
		var compareValueFunction = getCompareFunction(fieldDefinition);
		
		function compareValues(valuesA, valuesB) {
			var valueA = valuesA[columnName];
			var valueB = valuesB[columnName];
			
			return (sortAscending ? 1 : -1) * compareValueFunction(valueA, valueB);
		}
		
		valuesList.sort(compareValues);
		
	}
	
	
})();