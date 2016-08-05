Ext.define('Yamma.store.services.Service',{
	
	extend : 'Ext.data.Store',
	
	statics : {
		DATASOURCE_URL : 'alfresco://bluedolmen/yamma/service'
	},
	
	fields : [
		{ name : 'isRootService', type : 'boolean'},
		{ name : 'parentService', type : 'string'},
		{ name : 'serviceManagers' },
		{ name : 'roles' }
	],
	
	proxy: {
		
	    type: 'ajax',
	    url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(Yamma.store.services.Service.DATASOURCE_URL),
	    
	    reader: {
	        type: 'json',
	        root: 'items'
	    }
	    
	}
	
});

