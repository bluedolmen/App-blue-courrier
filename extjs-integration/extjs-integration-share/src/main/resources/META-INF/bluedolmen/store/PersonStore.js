Ext.define('Bluedolmen.store.PersonStore', {
	
	extend : 'Ext.data.Store',
	requires : [
		'Bluedolmen.model.Person'
	],
	
	model : 'Bluedolmen.model.Person',
	pageSize : 10,
	
	includeGroups : false,
	
	constructor : function() {
		
		this.proxy = {
			type : 'ajax',
			url : Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://api/people'),
		    reader: {
		        type: 'json',
		        root: 'people'
		    },
			extraParams : {
				'groups' : false
			}
		};
		
		this.callParent(arguments);
		
	}
	
});