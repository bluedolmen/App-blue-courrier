Ext.define('Yamma.utils.Services', {
	
	SERVICE_DATASOURCE_URL : 'alfresco://bluedolmen/yamma/service?service={service}',
	
	singleton : true,
	
	cache : {},
	
	clearCache : function() {
		this.cache = {};
	},
	
	getDescription : function(service, onDescriptionAvailable) {
		
		//Ext.isFunction(onDescriptionAvailable) || Ext.Error.raise('IllegalArgumentException! The provided callback function is not a valid function!');
		onDescriptionAvailable = onDescriptionAvailable || Ext.emptyFn;
		if (!service) return;
		
		var 
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol( 
				this.SERVICE_DATASOURCE_URL.replace(/\{service\}/, service)
			),
			cachedValue = this.cache[service];
		;
		
		
		if (cachedValue) {
			
			onDescriptionAvailable(cachedValue);
			return cachedValue;
			
		} else {
			
			Bluedolmen.Alfresco.jsonRequest({
				url : url,
				onSuccess : function onSuccess(jsonResponse) {
					
					me.cache[service] = jsonResponse;
					onDescriptionAvailable(jsonResponse);
					
				}
			});
			
		}
		
		// returns undefined
	}
	
//	isServiceManager : function(serviceName, userName) {
//				
//    	Yamma.Services.getDescription(onServiceAvailable);
//    	
//    	function onServiceAvailable(serviceDescription) {
//    		
//			if (!userName) {
//				// refers to the current user
//				return serviceDescription.roles.isServiceManager;
//			} else {
//				
//				return Ext.Array.some(serviceDescription.serviceManagers, function(serviceManager) {
//					return serviceManager == userName;
//				});
//				
//			}
//    		
//    	}
//    	
//	}

});