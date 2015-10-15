Ext.define('Bluedolmen.utils.alfresco.grid.AlfrescoStoreGridPanel', {
	
	extend : 'Ext.grid.Panel',
	alias : 'widget.alfrescostoregridpanel',
	
	requires : [
		'Bluedolmen.Store',
		'Bluedolmen.utils.alfresco.grid.AlfrescoStoreTable'
	],
	
	mixins : {
		alfrescostoretablepanel : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreTablePanel'
	},	

	initComponent : function() {
		
		this.mixins.alfrescostoretablepanel.initComponent.call(this);
		this.callParent();
	    
	},	
    
	 	
 	destroy : function() {
 		
		this.mixins.alfrescostoretablepanel.destroy.apply(this, arguments); 		
 		this.callParent(arguments);
 		
 	},
 	
 	/**
 	 * This method abstract the underlying store to return a record given an id
 	 * 
 	 * @param id
 	 * @returns
 	 */
 	getRecordById : function(id) {
 		
 		if (null == id) return null;
 		
 		var store = this.getStore();
 		if (null == store) return null;
 		
 		return store.getById(id); 		
 		
 	},
 	
 	findRecord : function(fieldName, value) {
 		
 		var store = this.getStore();
 		if (null == store) return null;

 		return store.findRecord(fieldName, value);
 		
 	}
 	
	
});
