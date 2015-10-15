(function() {

	const DEFAULT_FIELD_TYPE = "text";
	const COMPOSITE_TYPE = "composite";
	const COMPOSITE_SIGN = '!';

	/**
	 * A Singleton element meant to manage Datasource-definitions
	 * 
	 * @type
	 */
	DatasourceDefinitions = {
	
		definitions : {},
		
		getDatasourceIds : function() {
			
			var definedDatasources = [];
			for (datasourceDefinitionName in this.definitions) {
				definedDatasources.push(datasourceDefinitionName);
			};
			
			return definedDatasources;
		},
			
		/**
		 * Retrieve a new definition for a given datasource-id
		 * <p>
		 * If the new definition cannot be found, then null is returned and the
		 * status is set so that it indicates the caller that the resource cannot be
		 * found
		 * <p>
		 * The building of the DatasourceDefinition object is postponed while not
		 * retrieved expecting a slight improvement in terms of performance
		 * 
		 * @param {}
		 *            datasourceId
		 * @return {DatasourceDefinition}
		 */
		getDefinition : function(datasourceId) {
			
			var datasourceDefinition = this.getDeclarativeDefinition(datasourceId); 
			
			if (undefined === datasourceDefinition) {
				return null;
			}				
			
			if (! (datasourceDefinition instanceof DatasourceDefinition) ) {
				// The datasource-definition is supposed not to be initialized
				datasourceDefinition = new DatasourceDefinition(datasourceId, datasourceDefinition);
				this.definitions[datasourceId] = datasourceDefinition;
			}
			
			return datasourceDefinition;
		},
		
		/**
		 * This method should be used innerly to get the declarative definition.
		 * This method is not meant to be used by clients
		 */
		getDeclarativeDefinition : function(datasourceId) {
			if (null == datasourceId) {
				throw new Error('IllegalArgumentException! The provided datasource-id is not valid.');
			}
			
			return this.definitions[datasourceId];
		},
		
		/**
		 * Register a new datasource-definition
		 * <p>
		 * @param {} datasourceId
		 * @param {} config
		 */
		register : function(datasourceId, declarativeDefinition) {
			
			if (null == datasourceId || "" === datasourceId) {
				throw new Error("The provided datasourceId is not valid. Has to be a valid string");
			}
			
			if (null == declarativeDefinition || (null == declarativeDefinition.fields) && (!declarativeDefinition.extend)) {
				throw new Error("The provided definition is not valid since it should contain at least a key 'fields' typed as an Array");
			}
			
			this.definitions[datasourceId] = declarativeDefinition;
		},
		
		getFlatColumns : function(datasourceId) {
			
			var datasourceDefinition = DatasourceDefinitions.getDefinition(datasourceId);
			if (null == datasourceDefinition) return [];
					
			return datasourceDefinition.getFlatColumns();
			
		}
		
	};

	
	/**
	 * Helper function that get the list:
	 * - of ancestors w.r.t. the extend definition
	 * - of mixins definitions
	 */
	function getExtendedDeclarations(declarativeDefinition) {
		
		if (null == declarativeDefinition) return [];
		
		var
			mixins = {},
			definitions = [],
			localMixins,
			parentDefinition,
			i, len,
			id
		;
		
		while (true) {
			
			localMixins = declarativeDefinition.mixins || [];
			for (i = 0, len = localMixins.length; i < len; i++) {
				id = localMixins[i];
				mixins[id] = DatasourceDefinitions.getDeclarativeDefinition(id);
			} 
			
			id = declarativeDefinition.extend;
			if (null == id) break;
			
			declarativeDefinition = DatasourceDefinitions.getDeclarativeDefinition(id);
			definitions.push(declarativeDefinition);
			
		}
		
		for (id in mixins) {
			if (null == mixins[id]) continue;
			definitions.push(mixins[id]);
		}
		
		return definitions;				
	}
	

	DatasourceDefinition = function(datasourceId, declarativeDefinition) {
		
		var me = this;
		
		manageExtendedDefinition(declarativeDefinition);
		
		// PRIVATE fields
		var 
			prefix = declarativeDefinition.prefix || '',
			_datasourceId = datasourceId,
			fields = [],
			quickAccessMap = {},
			filters = declarativeDefinition.filters || {},
			searchType = declarativeDefinition.searchType || 'lucene', // default to lucene
			searchAdditional = declarativeDefinition.searchAdditional || {},
			columns = declarativeDefinition.columns
		;

		// PUBLIC methods
		
		this.getDatasourceId = function() {
			return _datasourceId;
		}
		
		/**
		 * An accessor to a field definition
		 */
		this.getFieldDefinition = function(name) {
			
			if (!name) {
				throw new Error("IllegalArgumentException! The provided name is not valid. Has to be a valid string");
			}
			
//			var compositeSignIndex = name.indexOf(COMPOSITE_SIGN);
//			if (compositeSignIndex > 0) {
//				var compositeFieldName = name.substring(0, compositeSignIndex);
//				//var delegatedFieldName = name.substring(compositeSignIndex + 1);
//				
//				var compositeField = this.getFieldDefinition(compositeFieldName);
//				if (!compositeField) return null;
//				
//				return compositeField.getFieldDefinition(name);
//			}
			
			return quickAccessMap[name];
			
		}
		
		
		/**
		 * An accessor to the list of fields
		 * @return {DatasourceField[]} a copy of the inner fields
		 */
		this.getFields = function() {
			return fields.slice(0);
		}
		
		/**
		 * Get the id-properties
		 * 
		 * @return {String[]} The list of id-properties.
		 */
		this.getIdProperties = function() {
			
			var idProperties = Utils.map(fields, function(field) {
				if (field.isId()) return field.getName();
			});
			
			return idProperties;
		}
		
		/**
		 * An accessor to a given filter identified by its id (name)
		 */
		this.getFilter = function(filterId) {
			var filter = filters[filterId];
			if (filter) return filter;
			
			// Try to get the field definition from the filter-id
			var fieldDefinition = this.getFieldDefinition(filterId);
			if (!fieldDefinition) return null;
			
			// Check whether the field is native to apply default filtering function
			if (fieldDefinition.isNative()) return;
		}
		
		this.getSearchType = function() {
			return searchType;
		}
		
		this.getSearchAdditional = function() {
			return searchAdditional;
		}
		
		this.getDelegated = function() {
			
			if (undefined !== this.delegatedDatasource) return this.delegatedDatasource;
			
			if (this.isAggregate()) {
				var delegatedDatasourceId = searchAdditional.datasource;
				if (null == delegatedDatasourceId) return null;
				
				this.delegatedDatasource = DatasourceDefinitions.getDefinition(delegatedDatasourceId);
			} else {
				this.delegatedDatasource = null;			
			}
			
			return this.delegatedDatasource;
			
		}
		
		this.isAggregate = function() {
			return 'aggregate' === searchType;
		}
		
		this.getColumns = function() {
			return columns;
		}
		
		// END PUBLIC methods
		
		definePublicBaseAccessors();
		defineFields();
		enrichFieldDefinitions();
		
		// register into singleton factory
		DatasourceDefinitions.definitions[datasourceId] = this;

		
		/*
		 * PRIVATE INNER FUNCTIONS 
		 */
		
		/**
		 * Define public R/O accessors on base properties (properties with
		 * 'base' prefix)
		 */
		function definePublicBaseAccessors() {

			function setNewPublicAccessor(propertyName, propertyValue) {
				var accessorName = 'get' + Utils.String.capitalize(propertyName);
				
				me[accessorName] = function() {
					var _propertyValue = propertyValue;
					return _propertyValue;
				}
			}

			
			for (var propertyName in declarativeDefinition) {				
				if (propertyName.indexOf('base') != 0) continue;
				
				// property starts with 'base' => define a getAccessor
				setNewPublicAccessor(propertyName, declarativeDefinition[propertyName]);
				
			}
			
		}
		
		/**
		 * Helper function to define the fields given their declarative definitions
		 */
		function defineFields() {
			
			Utils.forEach(declarativeDefinition.fields,				
				function(fieldDefinition) {
					var datasourceField = new DatasourceDefinition.DatasourceField(fieldDefinition, me, prefix);
					addField(datasourceField);
				}
			);
			
		}
		
		/**
		 * Helper function that add the field to the list of fields and which
		 * also enrich a map to enable a quick access to the fields given their
		 * names
		 */
		function addField(datasourceField) {
			
			fields.push(datasourceField);
			addToCache(datasourceField);
			
			if (COMPOSITE_TYPE == datasourceField.getType()) {
				// also add "children" of composite types to quick access type
				// to avoid following the composite fields (associations)
				Utils.forEach(datasourceField.getFields(),
					function(delegatedField) {
						addToCache(delegatedField);
					}
				);
			}
			
			function addToCache(datasourceField) {
				var datasourceFieldName = datasourceField.getName(); 
				quickAccessMap[datasourceFieldName] = datasourceField;
			}
		}
		
		/**
		 * Enrich the field definition for aggregates that do not define a field
		 * of the name of the groupBy field.
		 */
		function enrichFieldDefinitions() {
			if (!me.isAggregate()) return;
			
			var groupByFieldId = searchAdditional.groupBy;
			if (undefined !== me.getFieldDefinition(groupByFieldId)) return;
			
			var datasourceField = new DatasourceDefinition.DatasourceField(
				{
					name : groupByFieldId,
					type : 'string',
					evaluate : function(groupId) {
						return groupId || '';
					}
				}, 
				me, 
				prefix
			);
			addField(datasourceField);
		}
		
		/**
		 * Helper function to process extended declarations 
		 * - poor inheritance concept
		 * - mixins (aspects) concept
		 */
		function manageExtendedDefinition(declarativeDefinition) {
			
//			var extendedDefinitionId = declarativeDefinition.extend;
//			if (undefined === extendedDefinitionId) return;
//			
//			var parentDefinition = DatasourceDefinitions.getDeclarativeDefinition(extendedDefinitionId);
//			if (null == parentDefinition) return;
			
			var 
				extendedAncestors = getExtendedDeclarations(declarativeDefinition),
				fieldSet,
				fieldIndexFunction = function(field) { return Utils.isString(field) ? field : field.name; } 
			;
			declarativeDefinition.fields = (declarativeDefinition.fields || []);
			fieldSet = Utils.Array.toMap(declarativeDefinition.fields, fieldIndexFunction);
			
			Utils.forEach(extendedAncestors,
					
				function(ancestor) {
					
					// Merge fields if necessary
					if (ancestor.fields) {
						Utils.applyIf(fieldSet, Utils.Array.toMap(ancestor.fields, fieldIndexFunction) );
					}
					
					// Merge filters if necessary
					if (ancestor.filters) {
						Utils.applyIf(declarativeDefinition.filters, ancestor.filters);
					}
					
					// Copy all properties from the parent which do not overlap existing ones
					Utils.applyIf(declarativeDefinition, ancestor);
					
				}
			
			);
			
			declarativeDefinition.fields = Utils.Object.values(fieldSet);
			
		}
		
	};
	
	DatasourceDefinition.prototype.getParentField = function(fieldName) {
			
		var compositeSignIndex = fieldName.indexOf(COMPOSITE_SIGN);
		if (-1 == compositeSignIndex) return null;
		
		var compositeFieldName = fieldName.substring(0, compositeSignIndex);
		//var delegatedFieldName = name.substring(compositeSignIndex + 1);
		
		return this.getFieldDefinition(compositeFieldName);
		
	}

	
	DatasourceDefinition.NodeEvaluationResult = function() {};
	
	/**
	 * Evaluate a node
	 * 
	 * @argument {String} fieldName Limit the evaluation to the field with the given name
	 * TODO: This argument should be generalized to a set of fields. This is currently used in
	 * search to process deferred sorts
	 * @return {Object} a list of Object, the latter representing an indexed
	 *         set of values, or a single value if the list is reduced to one
	 *         element.
	 */
	DatasourceDefinition.prototype.evaluateNode = function(node, fieldName) {
				
		var 
			me = this,
			
			cache = (fieldName !== undefined && !Utils.isString(fieldName))
				? fieldName
				: Utils.Object.create(Utils.Cache, { cacheSize : 100 }),
			
			values = (Utils.isString(fieldName))
				? getSingleValue()
				: getValues(),
				
			result = [],
			
			// defines a cache of array-typed properties for optimization of isRich() function
			arrayTypedFields = Utils.ArrayToMap(
					
				Utils.filter(me.getFields(),
					// acceptFunction
					function(fieldDefinition) {
						return 'array' == fieldDefinition.getType();
					}
				),
				
				// keyFunction
				function(field) {
					return field.getName();
				}
			
			)			
		;
		
		if (!isRich(values)) return values;
		
		// Realize a JOIN-like operation on list-values
		expandListValues(values); // Fill result as a side effect
		return Utils.unwrapList(result);
		
		
		function getValues() {
			
			var 
				propertyValues = new DatasourceDefinition.NodeEvaluationResult(),
				fieldsDefinition = me.getFields()
			;
			
			Utils.forEach(fieldsDefinition, function(fieldDefinition) {
					
				var 
					itemValue = fieldDefinition.evaluate(node, cache),
					fieldName = fieldDefinition.getName(),
					fieldType = fieldDefinition.getType()
				;
				
				if (COMPOSITE_TYPE === fieldType) {
					Utils.apply(propertyValues, itemValue);
				} else {
					propertyValues[fieldName] = itemValue;
				}
					
			});
			
			return propertyValues;
			
		}
		
		function getSingleValue() {
			
			var parentFieldDefinition = me.getParentField(fieldName);
			if (null != parentFieldDefinition) return parentFieldDefinition.evaluate(node, fieldName);
			
			// This is not a composite field in this context		
			var fieldDefinition = me.getFieldDefinition(fieldName);
			return fieldDefinition.evaluate(node, cache);
			
		}
		
		
		/**
		 * Returns true if one of the value is of type Array (list of values)
		 */
		function isRich(values) {
			
//			for (var propertyName in values) {
//				var propertyValue = values[propertyName];
//				if (Utils.isArray(propertyValue)) return true;
//			}
			
			var
				propertyName = null,
				propertyValue = null
			;
			
			for (propertyName in values) {
				propertyValue = values[propertyName];
				if (Utils.isArray(propertyValue) && 'undefined' === arrayTypedFields[propertyName]) return true;
			}
			
			return false;
			
		}
		
		function expandListValues(values) {

			expandPropertyValues(new DatasourceDefinition.NodeEvaluationResult(), getPropertyNames()); 
			
			function getPropertyNames() {
				var propertyNames = [];
				for (var propertyName in values) {
					propertyNames.push(propertyName);
				}
				return propertyNames;
			}

			function expandPropertyValues(currentFlattenValues, leavingPropertyNames) {
				
				// Final case
				if (0 == leavingPropertyNames.length) {
					result.push(currentFlattenValues);
					return;
				}
				
				// Recursion
				var currentPropertyName = leavingPropertyNames[0]; // head
				var currentValue = values[currentPropertyName];
				leavingPropertyNames = leavingPropertyNames.slice(1); // Get a local copy here (tail removing head)

				// A non-optimized version would use the following statement to get a uniform way of processing
				// var values = [].concat(currentValue); // Whether or not it is an array, we get a flatten array
				// The optimized version reuse the currentFlattenValues array which do not need to be copied
				if (Utils.isArray(currentValue)) {
					Utils.forEach(currentValue,
						function(value) {
							var localFlattenValues = new DatasourceDefinition.NodeEvaluationResult();
							Utils.apply(localFlattenValues, currentFlattenValues);
							localFlattenValues[currentPropertyName] = value;
							
							expandPropertyValues(
								localFlattenValues, 
								leavingPropertyNames
							);
						}
					)					
				} else {
					currentFlattenValues[currentPropertyName] = currentValue;
					expandPropertyValues(currentFlattenValues, leavingPropertyNames);
				}
				
			}
			
		}
		
		
	};

	/**
	 * This simple Object defines a Field in Datasource definitions
	 * <p>
	 * A DatasourceField is defined by the following structure :
	 * {
	 *    getName : function() -> string,
	 *    getLabel : function() -> string,
	 *    getDescription : function() -> string,
	 *    getType : function() -> string,
	 *    evaluate : function(Node) -> Object, // returns the value of the node (in the datasource)
	 *    isNative : function() -> boolean // whether the definition refers to a native Alfresco property field
	 * }
	 * @param {Object/String} config a string referring to an Alfresco property (prefixed) QName, OR a config object
	 * <p>
	 * {
	 *    name : string,
	 *    label : string,
	 *    description : string,
	 *    type : string,
	 *    evaluate : function(node) -> Object, // returns the value of the node (in the datasource)
	 * }
	 * 
	 */
	DatasourceDefinition.DatasourceField = function(config, datasourceDefinition, prefix) {
		
		if (config instanceof DatasourceDefinition.DatasourceField) {
			return config;
		}
	
		
		
		/* PRIVATE FIELDS */
		var 
			me = this,
		// if prefix is defined, it is not a native field... This logic has certainly to be improved
			isNative = true, 
			prefix = prefix || '',
			localConfig = {
				label : null,
				description : null,
				type : null,
				isId : false
			}
		;
		
		
	
		/* PUBLIC METHODS */
		this.getName = function() {
			return prefix + localConfig.name;
		}
		
		this.getPropertyName = function() {
			return localConfig.propertyName;
		}
		
		this.getLabel = function() {
			return localConfig.label;
		}
		
		this.getDescription = function() {
			return localConfig.description;
		}
		
		this.getType = function() {
			return localConfig.type || 'string';
		}
		
		this.isId = function() {
			return localConfig.isId;
		}
		
		this.isNative = function() {
			return isNative;
		}
		

		
		
		
		/* MAIN LOGIC */
		var isScriptNodeProperty = false;
		
		if ('string' == typeof(config)) {
			
			localConfig.isId = (/\*$/).test(config);
			if (true === localConfig.isId) {
				// Strip '*' character
				config = config.substring(0, config.length - 1);
			}
			
			isScriptNodeProperty = config.indexOf('@') == 0; // starts-with '@'
			if (true === isScriptNodeProperty) {
				// String '@' character
				config = config.substring(1);
				
				var slashIndex = config.indexOf('/'); 
				if (-1 != slashIndex) {
					localConfig.type = config.substring(slashIndex + 1);
					config = config.substring(0, slashIndex);
				}
			}
			
			isNative = !isScriptNodeProperty && !prefix;
			localConfig.name = config;
			
		} else {
			
			if (!config.name) {
				throw new Error("The provided config object should contain the 'name' property as a String");
			}
			
			// Copy all (non-function) fields from config into localConfig
			for (var key in config) {
				var property = config[key];
				if (property instanceof Function) continue;
				
				localConfig[key] = config[key];
			}
			
			this.evaluate = config.evaluate;
			isNative = false;
			
			
			var isComposite = (COMPOSITE_TYPE === config.type);
			if (isComposite) {
				manageComposite();
				return; // end here for composite
			}			
		}
		
		if (!localConfig.propertyName) {
			// propertyName is not set, use name as default
			localConfig.propertyName = localConfig.name;
		}		
		
		setEvaluateFunction();
		setDataTypeName();
		setLabelAndDescription();
		// END OF MAIN LOGIC HERE
		
		
		
		
		
		
		/* HELPER PRIVATE FUNCTIONS */
		function manageComposite() {
			
			// define composite
			if (config.fields && ('string' == typeof config.fields) ) {
				// The fields definition is defined in a delegated datasource definition
				
				var 
					delegatedDatasourceId = config.fields,
					delegatedDatasourceDefinition = DatasourceDefinitions.getDeclarativeDefinition(delegatedDatasourceId)
				;
				if (!delegatedDatasourceDefinition) {
					throw new Error("IllegalStateException! The provided datasource-id '" + delegatedDatasourceId + "' is not a valid datasource");
				}
				
				// Quick and dirty hack to also get the inherited fields
				config.fields = (delegatedDatasourceDefinition.fields || []).slice(0);
				Utils.forEach(getExtendedDeclarations(delegatedDatasourceDefinition),
					function(ancestor) {
						if (!ancestor.fields) return;
						config.fields = config.fields.concat(ancestor.fields);
					}
				);
			}
			
			var compositeDatasourceName = datasourceDefinition.getDatasourceId() + '.' + config.name;
			config.prefix = config.name + COMPOSITE_SIGN;
			var compositeDatasource = new DatasourceDefinition(compositeDatasourceName, config);
			
			me.getFields = function() {
				return compositeDatasource.getFields();
			}
			
			me.getFieldDefinition = function(name) {
				return compositeDatasource.getFieldDefinition(name);
			}
			
			me.evaluate = function evaluateNode(node, fieldName) {
				
				var targetObject = node;
				if (undefined !== config.evaluate) {
					targetObject = config.evaluate(node);
				}
				
				return compositeDatasource.evaluateNode(targetObject, fieldName);
			}
			
		}
		
		function setEvaluateFunction() {
			
			// Define a default evaluate() method if none yet defined
			var evaluateFunction = me.evaluate;
			
			if ( Utils.isFunction(evaluateFunction) ) {
				
				if ('datasource' == localConfig.type) {
					// TODO: Should support any kind of datasource
					// Current implementation only supports the current one
					me.evaluate = function(node) {
							
						var children = evaluateFunction(node) || [];
						
						if (Utils.isArray(children)) {
							return Utils.map(children, function(child) {
								return datasourceDefinition.evaluateNode(child);
							});							
						} else {
							return datasourceDefinition.evaluateNode(children);
						}
							
					}
				}
				
				return;
				
			}
			
			me.evaluate = isScriptNodeProperty 
				? evaluateAsScriptNodeProperty 
				: evaluateAsPropertyName
			;
				
			function evaluateAsPropertyName(node) {
				var 
					propertyName = localConfig.propertyName,
					propertyValue = node.properties[propertyName]
				;
				
				return (null == propertyValue) ? "" : propertyValue;				
			};
			
			function evaluateAsScriptNodeProperty(node) {
				var 
					propertyName = localConfig.name, // localConfig.propertyName would work so
					propertyType = localConfig.type,
					propertyValue = node[propertyName]
				;
				
				if (null == propertyValue) return '';
				return ('string' == propertyType) ? propertyValue.toString() : propertyValue;
			}

		}
	
		// Deduce the type of the field if none is provided, default to DEFAULT_FIELD_TYPE
		function setDataTypeName() {
			var type = localConfig.type;
			if (null != type) return;
			
			var dataTypeName = getDataTypeName(localConfig.propertyName, DEFAULT_FIELD_TYPE);
			localConfig.type = me.typeMap[dataTypeName] || 'string';
				
			function getDataTypeName(propertyName, defaultTypeName) {
				var propertyDefinition = sideDictionary.getPropertyDefinition(propertyName);
				if (null == propertyDefinition) return defaultTypeName;
					
				var dataTypeDefinition = propertyDefinition.getDataType();
				if (null == dataTypeDefinition) return defaultTypeName;
				
				var dataTypeQName = dataTypeDefinition.getName();
				return Utils.asString(dataTypeQName.toPrefixString());
			}
			
		}
		
		// Try to deduce the label of the field if none is provided
		function setLabelAndDescription() {
			var label = localConfig.label;
			if (null != label && 'string' == typeof(label)) return
			
			var propertyDefinition = sideDictionary.getPropertyDefinition(localConfig.propertyName);
			if (null == propertyDefinition) return;
			
			var label = propertyDefinition.getTitle();
			if (null == label) return;
			localConfig.label = label;
			
			var description = propertyDefinition.getDescription();
			if (null != description) {
				localConfig.description = description;
			}				
			
		}
		
	};
	
	DatasourceDefinition.prototype.getFlatColumns = function() {
		
		var 
			fields = this.getFields(),
			columns = []
		;
				
		mergeFields(fields);
		
		function mergeFields(fields) {
			
			Utils.forEach(fields, function(field) {
				
				if ('composite' === field.getType()) {
					mergeFields(field.getFields());
				} else {
					
					columns.push(
						{
							name : field.getName(),
							label : field.getLabel(),
							description : field.getDescription(),
							datatype : field.getType()
						}
					);
					
				}
				
			});
			
		}
		
		return columns;
		
	};

	/**
	 * For future use
	 * <p>
	 * Translate Alfresco type prefixed-qname to familiar simple datatype names
	 * 
	 * @type Map<String, String>
	 */
	DatasourceDefinition.DatasourceField.prototype.typeMap = {
		  "d:any" : "string",
	      "d:text" : "string",
	      "d:mltext" : "string",
	      "d:content" : "url",
	      "d:int" : "int",
	      "d:long" : "long",
	      "d:float" : "float",
	      "d:double" : "double",
	      "d:date" : "date",
	      "d:datetime" : "date",
	      "d:boolean" : "boolean",
	      "d:qname" : "string",
	      "d:noderef" : "string",
	      "d:childassocref" : "string",
	      "d:assocref" : "string",
	      "d:path" : "string",
	      "d:category" : "string",
	      "d:locale" : "string",
	      "d:version" : "string",
		  "d:period" : "string"	
	};

	/**
	 * This static method enables to evaluate a property value on a node
	 * following a given association (given its name). The association may
	 * expect a unique value (unique parameter should be set to true to get the
	 * appropriate output). The returned value is either a simple string when
	 * the expected result is unique or a JSON Array string.
	 */
	DatasourceDefinition.DatasourceField.prototype.evaluateAssocProperty = function(node, assocName, propertyName, unique, noneValue) {
		if (null == node) return null;
		if (!assocName) throw new Error('IllegalArgumentException! The provided association-name is invalid');
		if (!propertyName) throw new Error('IllegalArgumentException! The provided property-name is invalid');
		
		unique = true === unique;
		noneValue = undefined === noneValue ? '' : noneValue;
		
		var assocNodes = node.assocs[assocName];
		if (null == assocNodes || assocNodes.length == 0) return unwrapUniqueAsResult([]);
		
		if (unique && assocNodes.length > 1) {
			logger.warn('Warning! Several matching nodes. This is an incorrect state. Only the first node-value will be returned!');
		}
		
		var propertyValues = Utils.map(assocNodes, function(node) {
			var propertyValue = ('function' == typeof propertyName) ? propertyName(node) : node.properties[propertyName];
			if (null == propertyValue) return '';
			
			return propertyValue;
		});
		
		return unwrapUniqueAsResult(propertyValues);
		
		
		function unwrapUniqueAsResult(resultingArray) {
			if (unique) {
				if (resultingArray.length == 0) return noneValue;
				else return resultingArray[0];
			}
			
			return resultingArray.toSource();
		}
		
	};
	
	DatasourceDefinition.FilteringFunction = function(config) {
		
		if ('string' === typeof(config)) {
			this.typeName = typeName;
		} else {
			if (! config.applyQueryFilter) {
				throw new Error('IllegalStateException! The view configuration does not respect the filter configuration (missing applyQueryFilter function)');
			}
			
			this.applyQueryFilter = config.applyQueryFilter;
		}
		
	};
	
	DatasourceDefinition.FilteringFunction.prototype.applyQueryFilter = function(query, value) {
		
		if (undefined === this.typeName) {
			throw new Error('IllegalStateException! The filter is not correctly configured (missing typeName for the default filtering function)');
		}
		
		return Utils.Alfresco.getLuceneAttributeFilter(this.typeName, value);		
	}
	
})();


