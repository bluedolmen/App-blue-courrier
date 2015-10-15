Ext.define('Bluedolmen.utils.alfresco.config.AppConfigFactory', {
	
	requires : [
	    'Bluedolmen.utils.alfresco.Alfresco'
	],
	
	CONFIG_GET_URL : 'alfresco://bluedolmen/app-config/{configId}',
	
	singleton : true,
	

	/**
	 * 
	 * @param configs:
	 *            An Object whose keys are the config-ids
	 *            and the values are the target namespace;
	 */
	initConfigs : function(configs, callback) {
		
		var 
			me = this,
			configNb = Ext.Object.getSize(configs),
			successfulNb = 0
		;
		
		function decreaseCounter(targetNamespace, successful) {
			
			configNb--;
			if (successful) successfulNb++;
			
			if (configNb <= 0) {
				callback(successfulNb, Ext.Object.getSize(configs) - successfulNb);
			}
			
		}
		
		Ext.Object.each(configs, function(configId, targetNamespace) {
			
			me.initConfig(configId, targetNamespace, decreaseCounter);
			
		});
		
	},
	
	initConfig : function(configId, targetNamespace, callback) {
		
		var
			me = this,
			Alfresco = Bluedolmen.utils.alfresco.Alfresco,
			Ajax = Alfresco.getAjax(),
			context, indexOfFirstDot
		;
		
		if (!configId || !Ext.isString(configId)) {
			Ext.Error.raise('The config-id is not a valid non-empty string');
		}
		
		if (!targetNamespace) { // Does not allow empty-string
			targetNamespace = "Bluedolmen." + configId;
		}
		
		indexOfFirstDot = configId.indexOf('.');
		if (-1 != indexOfFirstDot) {
			configId = configId.replace('.','/'); // only first dot is replaced
		}
		
		if (!Ext.isString(targetNamespace)) {
			Ext.Error.raise('IllegalArgumentException! The provided target namespace is not a String');
		}
		
		targetNamespace = Ext.namespace(targetNamespace);
		
		callback = Ext.isFunction(callback) ? callback : Ext.emptyFn;
		
		Ajax.request({
			
			url : Alfresco.resolveAlfrescoProtocol(me.CONFIG_GET_URL.replace(/\{configId\}/, configId) ),
			
			successCallback : {
				
				fn : function(response) {
					
					var config = response.json;
					
					if (undefined == config && response.serverResponse) {
						// Try to parse the responseText as JSON (the mimetype is not correctly set)
						config = Ext.JSON.decode(response.serverResponse.responseText, true /* safe */);
					}
					
					if (config && undefined != config.config) {
						Ext.apply(targetNamespace, config.config);						
						callback(targetNamespace, true /* success */);
					}
					else {
						callback(null, false /* success */);
					}
					
				}
		
			},
			
			// failure does not raise any message
		
			failureCallback : {
				
				fn : function() {
					
					callback(null, false /* success */);
					
				}
				
			}
		
		});				
		
	}
	
});