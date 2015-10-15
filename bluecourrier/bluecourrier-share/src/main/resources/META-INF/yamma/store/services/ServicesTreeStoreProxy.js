Ext.define('Yamma.store.services.ServicesTreeStoreProxy', {
	
    extend : 'Ext.data.proxy.Rest',
    
	url : 'alfresco://bluedolmen/yamma/services/{serviceName}/children' 
		+ '?' + 'depth=-1'
		+ '&' + 'membership={membership}',	    
    
    appendId : false,
    showMembership : false,

    buildUrl:function (request) {
    	
		var me        = this,
	        operation = request.operation,
	        records   = operation.records || [],
	        record    = records[0],
	        url       = me.getUrl(request),
	        id        = record ? record.getId() : operation.id
		;
	
		url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
			url.replace(/\{membership\}/, '' + this.showMembership)
		);
	        
	        
		url = url.replace(/\{serviceName\}/, id);
	    request.url = url;
	
	    return me.callParent(arguments);
	    
  	}    
    
});

