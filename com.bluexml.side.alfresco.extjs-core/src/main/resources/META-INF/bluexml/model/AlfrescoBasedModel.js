
/**
 * TODO : Terminate or remove
 * !! This class is just a test and is not terminated!!!
 */
Ext.define('Bluexml.model.AlfrescoBasedModel', {
    extend: 'Ext.data.Model',
   
    inheritedStatics: {
    	  _fields : null
    },
    
    constructor : function(name, namespacePrefix ) {
    	
    	if (undefined === name) {
    		throw new Error('Undefined name');
    	}
    	namespacePrefix = namespacePrefix || 'cm';
    	
    	return this;
    },
    
    fields: ['authorityName'],
    
    proxy: {
        type: 'rest',
        url: 'data/stations.json',
        reader: {
            type: 'json',
            root: 'results'
        }
    },
    
        initFields : function() {
    	
		if (null != this.self._fields) {
			return this.self._fields;
		}
    
		Ext.Ajax.request({
			url: WS_FIELDS_URL,
			
			success: function ( result, request ) {
				var jsonData = Ext.util.JSON.decode(result.responseText);
				
				if (!Array.isArray(jsonData)) {
					throw new Error('Cannot retrieve the properties of a "cm:person": the result is not a list of properties');
				}
				
				var fields = Ext.Array.map(jsonData,
					function(propertyDescription, index, array) {
						var name = propertyDescription['name'];
						
						if (undefined === name) {
							throw new Error('Cannot get the name of the property');
						}
						
						return name;
					}
				);

				this.self._fields = fields;
             },
             
			failure: function ( result, request ) {
				throw new Error("Cannot retrieve the properties of a cm:person");
            }
             
		});
		

		
    }

});