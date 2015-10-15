Ext.define('Yamma.store.categories.CategoriesTreeStoreProxy', {
	
    extend : 'Ext.data.proxy.Rest',
    	
	url : 'alfresco://bluedolmen/categories/node/{nodeRef}' 
		+ '?' + 'perms={perms}'
		+ '&' + 'children=true'
	,	    
    
    appendId : false,
    rootNodeRef : 'alfresco://category/root',
    
    perms : false,

    buildUrl:function (request) {
    	
		var me        = this,
	        url       = me.getUrl(request),
	        operation = request.operation,
	        records   = operation.records || [],
	        record    = records[0],
	        id        = record ? record.getId() : operation.id
		;
	
		url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
			url
				.replace(/\{perms\}/, '' + this.perms)
		);
	    
		if ('root' == id) {
			id = this.rootNodeRef;
		}
	        
		url = url.replace(/\{nodeRef\}/, id.replace(/\:\/\//, '/'));
	    request.url = url;
	
	    return me.callParent(arguments);
	    
  	},
  	
    reader: {
        type: 'json',
        root: 'items'
    }
    
});

