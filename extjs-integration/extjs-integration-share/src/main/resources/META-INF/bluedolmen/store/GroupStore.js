Ext.define('Bluedolmen.store.GroupStore', {
	
	extend : 'Ext.data.Store',
	requires : [
		'Bluedolmen.model.Group'
	],
	
	model : 'Bluedolmen.model.Group',
	pageSize : 10,
	
	// /api/groups?shortNameFilter={shortNameFilter?}&amp;zone={zone?}&amp;maxItems={maxItems?}&amp;skipCount={skipCount?}&amp;sortBy={sortBy?}
	constructor : function() {
		
		this.proxy = {
			type : 'ajax',
			url : Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://api/groups'),
		    reader: {
		        type: 'json',
		        root: 'data'
		    },
			extraParams : {
				'zone' : 'APP.DEFAULT'
			}
		};
		
		this.callParent(arguments);
		
	}
	
});