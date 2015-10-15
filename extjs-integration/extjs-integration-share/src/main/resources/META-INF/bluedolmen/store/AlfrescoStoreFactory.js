Ext.define('Bluedolmen.store.AlfrescoStoreFactory', {

	alias : ['Bluedolmen.StoreFactory'],
	
	requires : [
	    'Bluedolmen.store.AlfrescoStore'
	],
	
	ALFRESCO_TYPE_MAP : {
		"any" : "auto",
		"text" : "string",
		"mltext" : "string",
		"content" : "auto",
		"int" : "int",
		"long" : "long",
		"float" : "float",
		"double" : "double",
		"date" : "date",
		"datetime" : "date",
		"boolean" : "boolean",
		"qname" : "string",
		"noderef" : "string",
		"childassocref" : "string",
		"assocref" : "string",
		"path" : "string",
		"category" : "string",
		"locale" : "string",
		"version" : "string",
		"period" : "string"
	},
	
	config : {
		
		appId : null,
		storeTypeName : 'Bluedolmen.Store', // aka Bluedolmen.store.AlfrescoStore
		definitionUrl : 'alfresco://bluedolmen/{appId}/datasource/{datasourceId}/definition',
		dataUrl : 'alfresco://bluedolmen/{appId}/datasource/{datasourceId}/data'
		
	},
	
	applyDefinitionUrl : function(definitionUrl) {
		
		if (!definitionUrl)
			Ext.Error.raise('IllegalStateException! The definition URL has to be a valid non-empty String');
			
		if (definitionUrl.indexOf('{datasourceId}') == -1)
			Ext.Error.raise('IllegalStateException! The definition URL has to contain the {datasourceId} parameter');
			
		return definitionUrl;
	},
	
	applyDataUrl : function(dataUrl) {
		
		if (!dataUrl)
			Ext.Error.raise('IllegalStateException! The data URL has to be a valid non-empty String');
			
		if (dataUrl.indexOf('{datasourceId}') == -1)
			Ext.Error.raise('IllegalStateException! The data URL has to contain the {datasourceId} parameter');
			
		return dataUrl;
		
	},
	
	constructor : function(config) {
		
		if ('string' == typeof appId) this.setAppId(config);
		else this.initConfig(config);		
		
		var appId = this.getAppId();
		if (appId) {
			var definitionUrl = this.getDefinitionUrl();
			this.setDefinitionUrl(definitionUrl.replace(/\{appId\}/,appId));
			
			var dataUrl = this.getDataUrl();
			this.setDataUrl(dataUrl.replace(/\{appId\}/,appId));
		}
		
		this.callParent(arguments);
		
	},
	
	mapAlfrescoType : function(alfrescoLocalName) {
		
		return this.ALFRESCO_TYPE_MAP[alfrescoLocalName];
		
	},
			
	
	/**
	 * Request a datasource-definition from the Alfresco WS.
	 * @param {} datasourceId
	 * @param {Function} onDatasourceDefinitionRetrieved the callback function which is called
	 * when the datasource-definition is available. The callback function get a datasource-definition
	 * Object of the form:
	 * <p>
	 * definition {
	 *    id : string, // same id that the one passed to the function
	 *    fields : fielddef[]
	 * }
	 * <p>
	 * fielddef {
	 *    name : string, // the name (id) of the field
	 *    label : string, // the display label of the field (e.g. when mapping directly with a column-definition)
	 *    description : string, // a more complete description that may be used as a tooltip information
	 *    type : string // the type of the field as an Alfresco datatype localname 
	 * }
	 */
	requestDatasourceDefinition : function(datasourceId, onDatasourceDefinitionRetrieved, onFailure) {
		
		if (!datasourceId || 'string' !== typeof(datasourceId) ) {
			throw new Error("IllegalArgumentException! The datasourceId has to be provided and be a valid non-empty string");
		}
		
		var 
			definitionUrl = this.getDefinitionUrl(),		
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol( 
				definitionUrl.replace(/\{datasourceId\}/, datasourceId)
			)
		;
		
		Bluedolmen.Alfresco.jsonRequest({
		
			method : 'GET',
			
			url : url,
			
			onSuccess : function(datasourceDefinition) {
				
				var 
					fields = datasourceDefinition.fields
				;
				if (null == fields || !Ext.isArray(fields)) {
					throw new Error("Cannot find a valid fields definition");
				}
				
				onDatasourceDefinitionRetrieved(datasourceDefinition);
					
			},
			
			onFailure : onFailure
			
		});

	},
	
	requestNew : function(config, onStoreCreated, storeConfig, proxyConfig) {
		
		var 
			me = this,
			storeId = Ext.isString(config) ? config : config.storeId,
			onFailure
		;
		if (!storeId)
			Ext.Error.raise('IllegalArgumentException! The storeId is a mandatory argument (non-null and non-empty string)');
		
		storeConfig = storeConfig || config.storeConfig || {};
		proxyConfig = proxyConfig || config.proxyConfig || {};
		onStoreCreated = onStoreCreated || config.onStoreCreated || Ext.emptyFn;
		
		onFailure = config.onFailure || null;
		
		var 
			modelName = 'Bluedolmen.model.' + storeId,
			storeModel = Ext.ModelManager.getModel(modelName)
		;
		
		if (undefined === storeModel) {
			
			this.requestDatasourceDefinition(
				storeId,
				onDatasourceDefinitionRetrieved,
				onFailure
			);
			
		} else {
			createStore();
		}
		
		function onDatasourceDefinitionRetrieved(datasourceDefinition) {
			
			var 
				modelFields = mapFieldsDefinition(datasourceDefinition.fields),
				idProperty = datasourceDefinition.idProperty || 'nodeRef',
				derivedFields = config.derivedFields
			;
				
			if (Ext.isArray(derivedFields)) {
				modelFields = modelFields.concat(derivedFields);
			}
			
			Ext.define(modelName,
				{
					extend : 'Ext.data.Model',
					fields : modelFields,
					idProperty : idProperty
				},
				createStore // onClassCreated
			);
			
		};
		
		function getIdProperty(fields) {
			
			var idProperty = null;
			
			Ext.Array.forEach(fields, function(fieldDefinition) {
				if (true === fieldDefinition) {
					idProperty = fieldDefinition.name;
					return false; // stop iteration
				}
			});
			
			return idProperty;
			
		}
		
		/**
		 * createStore is bound to modelName
		 */
		function createStore() {

			var 
				newStoreId = me.getStoreTypeName() + '.' + storeId,
				
				proxyDefinition = getProxyDefinition(storeId), 
			
				newConfig = {
					storeId : newStoreId,
					model : modelName,
					proxy : proxyDefinition
				},
				
				newStore
			;
			
			Ext.applyIf(newConfig, storeConfig);
			
			newStore = Ext.create(me.getStoreTypeName(), newConfig);
			if (Ext.isFunction(onFailure)) {
				newStore.on('load', function(store, records, successful, eOpts) {
					if (successful) return;
					onFailure(store, eOpts);
				});
			}
			
			onStoreCreated(newStore);
			
		}
		
		function getProxyDefinition(storeId) {
			
			var
			
				dataUrl = me.getDataUrl(),
				
	    		url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
		    		dataUrl.replace(/\{datasourceId\}/, storeId)
		    	),
		    	
		    	proxy = {
				
			        type: 'ajax',
			        url: url,
			        
			        limitParam: 'maxItems',
			        reader : {
			        	type : 'json',
			        	root : 'items',
			        	totalProperty : 'totalRecords'
			        },
			        
			        encodeSorters : function(sorters) {
			        	return Ext.Array.map(sorters,
			        		function(sorter) {
			        			return sorter.property + '#' + sorter.direction;
			        		}
			        	).join(',');
			        },
			        
			        timeout : 120000
			        
			    }
			
		    ;
			
		    return Ext.Object.merge(proxy, proxyConfig);
		}
		
		
		// Get fields definition and map to extjs definition
		
		function mapFieldsDefinition(fieldsDefinition) {
			
			var fields = Ext.Array.map(fieldsDefinition, function (fieldDefinition) {
				
				var defaultFieldDefinition = applyDefaultDefinition(
					{
						name : fieldDefinition.name,
						type : me.mapAlfrescoType(fieldDefinition.type)
					}
				);
				
				var updatedFieldDefinition = null;
				if (config.onFieldDefinitionRetrieved) {
					updatedFieldDefinition = config.onFieldDefinitionRetrieved(fieldDefinition.name, defaultFieldDefinition);
				}
					
				return updatedFieldDefinition || defaultFieldDefinition;
				
			});
			
			return fields;
		}
		
		function applyDefaultDefinition(fieldDefinition) {
			
			var type = fieldDefinition.type;
			var additionalDefinition = {};
			switch (type) {
				
			case 'date':
					additionalDefinition.dateFormat = 'c';
					additionalDefinition.altFormats = 'Y-m-d|Y-m-d H:i:s';
			break;
			
			}
			
			Ext.apply(fieldDefinition, additionalDefinition);
			return fieldDefinition;
		}			
		
	}
	
	
});