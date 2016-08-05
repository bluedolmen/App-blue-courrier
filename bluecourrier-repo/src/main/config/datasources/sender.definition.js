(function() {
	
	// Meant to be used as a mixin
	DatasourceDefinitions.register('Sender',
		{
			
			extend : 'Sender',
			
			fields : [
			
			    YammaModel.SENDER_ORGANIZATION_NAME_PROPNAME,
				YammaModel.SENDER_INSTRUCTOR_NAME_PROPNAME,
				
				{
			    	name : YammaModel.SENDER_ASPECT_SHORTNAME + 'Address',
			    	type : 'string',
			    	evaluate: function(node) {
			    		
			    		// Made from a concatenation of the address elements
			    		return Utils.Array.clear([
			    		    node.properties[YammaModel.SENDER_ADDRESS_PROPNAME],
			    		    node.properties[YammaModel.SENDER_POSTCODE_PROPNAME],
			    		    node.properties[YammaModel.SENDER_CITY_PROPNAME]
			    		]).join('\n');
			    		
			    	}
				},
				
				{
			    	name : YammaModel.SENDER_ASPECT_SHORTNAME + 'Coordinates',
			    	type : 'string',
			    	evaluate: function(node) {
			    		
			    		// Made from a concatenation of the address elements
			    		return Utils.Array.clear([
			    		    node.properties[YammaModel.SENDER_EMAIL_PROPNAME],
			    		    node.properties[YammaModel.SENDER_TELEPHONE_PROPNAME],
			    		    node.properties[YammaModel.SENDER_INSTRUCTOR_MOBILE_PROPNAME]
			    		]).join('\n');
			    		
			    	}
				}

				
				
			]
	
		}
		
	);

})();