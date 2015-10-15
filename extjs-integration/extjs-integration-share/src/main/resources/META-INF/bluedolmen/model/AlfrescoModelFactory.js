/**
 * This factory is meant to generate dynamically Ext.data.Model-s
 * by using Alfresco model definitions.
 * The current implementation only manages properties mapping...
 * <p>
 * This implementation probably does not managed optimally high concurrent 
 * model-creation demands.
 */
 Ext.define('Bluedolmen.model.AlfrescoModelFactory', {
 	
 	requires: [
 		'Ext.data.Model',
 		'Bluedolmen.utils.alfresco.Alfresco'
 	],
 	
 	singleton: true,
		
 	config : {
 		prefix : null
 	},
 	
	models : {},
	
	/**
	 * Get the Alfresco local-name of a given Alfresco full-name (with
	 * prefix).
	 * 
	 * @param {String} typeName
	 *            the Alfresco full name, e.g. 'cm:content'
	 * @return {String} the part after the namespace
	 */
	getAlfrescoLocalName : function(typeName) {
		var colonIndex = typeName.indexOf(':');
		if (colonIndex < 0) return typeName;
		
		return typeName.substring(colonIndex + 1);
	},		
	
	/***
	 * Returns the Ext name corresponding to the Alfresco defined typename
	 * 
	 * Example:
	 * - `` cm:content -> Content ``
	 * - `` xx:com_bluedolmen_Content -> Com.bluedolmen.Content ``
	 * 
	 * @param {String} the Alfresco full-qualified type-name
	 * @return {String} The corresponding ExtJS class-name
	 */
	getExtTypeName : function(typeName) {

		var typeExtName = this.getAlfrescoLocalName(typeName);
		
		if (typeExtName.length == 0) {
			throw 'The provided type-name is invalid (zero-size)';
		}
		
		var prefix = this.getPrefix();
		if (null != prefix) {
			typeExtName = prefix + '_' + typeExtName;
		}
		
		typeExtName = Ext.String.capitalize(typeExtName);

		return typeExtName.replace(/_/g,'.');
		
	},
		
	/**
	 * Load the model of the given Alfresco typeName
	 * 
	 * @param typeName
	 *            as an Alfresco type-name String, e.g. cm:content
	 * @param onModelLoaded
	 *            a callback function that should be called on model creation.
	 *            This callback function takes the created model as parameter.
	 */
	loadModel : function(typeName, onModelLoaded) {
		
		var me = this;
		
		if (null == typeName) {
			throw 'The type-name should be provided';
		}
		
		if (typeName.indexOf(':') < 0) {
			throw "The provided type-name is not valid, should be of the form 'prefix:name', e.g. 'cm:content'"; 
		}

		var modelStore = me.models;

		function main() {
			
			var model = modelStore[typeName];
			
			if (undefined === model) {
				
				createModel(
				
					typeName,
					
					/* onModelCreated */ 
					{
						success : function(model) {
							
							if (undefined === model) { // Should probably not happen!
								throw 'Not a valid model!';
							}
							
							modelStore[typeName] = model;
							callOnModelLoaded(model);
							
						}
					}				
				);
				
			} else {
				
				callOnModelLoaded(model);
				
			}

		}
		
		/**
		 * Helper function that calls the callback-function if provided
		 */
		function callOnModelLoaded(model) {
			
			if (null == onModelLoaded) return;
			
			if (!Ext.isFunction(onModelLoaded)) {
				throw 'The onModelLoaded parameter has to be a Function';
			}

			onModelLoaded(model);
		}
		
		/**
		 * Helper function that creates the provided model type-name if
		 * it does not yet exist
		 */
		function createModel(alfrescoTypeName, onModelCreated) {
			
			/**
			 * Call the alfresco WebScript to get the type definition
			 */
			function callAlfrescoWS() {
				
				var WS_URL = 'alfresco://api/classes/{className}/properties';
				var Alfresco = Bluedolmen.utils.alfresco.Alfresco;

				// this define the alfresco normalized type-name (used by the Webscript), e.g. cm_content
				var alfrescoWSTypeName = typeName.replace(/:/,'_');
				var url = WS_URL.replace(/\{className\}/, alfrescoWSTypeName);

				var ajaxCall = Alfresco.getAjax();
				ajaxCall.jsonGet({
					url : Alfresco.resolveAlfrescoProtocol(url),
					
					successCallback : {
						fn : function(response) {
							if (undefined == response.json) return;
							
					        function getAlfrescoLocalPropertyName(propertyName) {
					        	
				        		if (undefined === propertyName) {
				        			throw new Error('Undefined property name ' + property.toString());
				        		}
				        		
				        		var colonIndex = propertyName.indexOf(':');
				        		if (colonIndex < 0) return propertyName;
				        		
				        		return propertyName.substring(colonIndex + 1);
					        }
					        
					        var fields = Ext.Array.map(response.json,
					        	function (property, index, array) {
					        		var propertyName = property['name'];
					        		return getAlfrescoLocalPropertyName(propertyName);
					        	}
					        );
					        
					        defineModel(fields);
						}
					}
				});				
				
			}

			
			function defineModel(fields) {
				
				Ext.define(
				
					me.getExtTypeName(alfrescoTypeName),
					
					{
					    extend: 'Ext.data.Model',
					    				        
					    fields: fields
					},
					
					function() {
						
						var successCallback = onModelCreated['success'];
						
				        if (undefined === successCallback) {
				        	throw "The provided callback Object should contain a 'sucess' function";
				        }
				        
				        successCallback(this);
						
					}
				);
	
			}			

			callAlfrescoWS();
			    			
		}

		main();
	} // End loadModel()
		
});
