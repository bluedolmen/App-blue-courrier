Ext.define('Yamma.store.services.Service',{
	
	extend : 'Ext.data.Store',
	
	statics : {
		DATASOURCE_URL : 'alfresco://bluexml/yamma/service'
	},
	
	fields : [
		{ name : 'isRootService', type : 'boolean'},
		{ name : 'parentService', type : 'string'},
		{ name : 'serviceManagers' },
		{ name : 'roles' }
	],
	
	proxy: {
		
	    type: 'ajax',
	    url : Bluexml.Alfresco.resolveAlfrescoProtocol(Yamma.store.services.Service.DATASOURCE_URL),
	    
	    reader: {
	        type: 'json',
	        root: 'items'
	    }
	    
	}
	
});

