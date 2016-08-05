Ext.define('Yamma.store.services.ShareSites', {
	
	extend : 'Ext.data.Store',
	
	statics : {
		DATASOURCE_URL : 'alfresco://api/sites'
	},
	
	fields : [
		{ name : 'id', type : 'string', mapping : 'shortName'},
		'shortName',
		'title',
		'description',
		'node',
		'url',
		'visibility',
		'siteManagers',
		{ name : 'isPublic' , type : 'boolean'}
	],
	
	proxy : {
		
	    type: 'ajax',
	    url : Bluedolmen.Alfresco.resolveAlfrescoProtocol("alfresco://api/sites"),
	    
	    reader: {
	        type: 'json'
	    }
	    
	}	
	
});

