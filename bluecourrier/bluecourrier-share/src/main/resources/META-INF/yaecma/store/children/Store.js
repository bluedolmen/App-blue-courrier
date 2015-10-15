Ext.define('Yaecma.store.children.Store', {

	statics : {
		
		WS_URL : 'alfresco://slingshot/doclib2/doclist/{type}/node/{nodeRef}' 		
		
	},
	
	extend : 'Ext.data.proxy.Ajax',
	
	constructor : function() {
		this.url = Bluedolmen.Alfresco.resolveAlfrescoProtocol( Yaecma.store.children.Proxy.WS_URL );		
		return this.callParent(arguments);
	},	

	
    limitParam: 'maxItems',
    reader : {
    	type : 'json',
    	root : 'items',
    	totalProperty : 'totalRecords'
    },
    
    // Beware! This method is normally private
    // There should be a more eleggant way of doing this
    getUrl : function(request) {
    	var 
    		url = this.callParent(arguments),
    		params = request.params
    	;
    	
    	url = url.replace('{type}', 'all');
    	
    	if (params.nodeRef) {
    		url = url.replace('{nodeRef}', params.nodeRef.replace(':/',''));
    		delete params.nodeRef;
    	}
    	
    	return url;	        	
    }	        
	
});

Ext.define('Yaecma.store.children.Store', {

	extend : 'Ext.data.Store',
	storeId : 'Children',

	model : 'Yaecma.model.children.Item',
	
	constructor : function(config) {
		this.proxy = Ext.create('Yaecma.store.children.Proxy');
		return this.callParent(arguments);
	}	
	
});
