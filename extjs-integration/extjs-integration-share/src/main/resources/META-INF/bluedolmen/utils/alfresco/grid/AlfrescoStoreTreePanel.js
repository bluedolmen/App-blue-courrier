Ext.define('Bluedolmen.utils.alfresco.grid.AlfrescoStoreTreePanel', {
	
	extend : 'Ext.tree.Panel',
	alias : 'widget.alfrescostoretreepanel',
	
	requires : [
		'Bluedolmen.Store',
		'Bluedolmen.utils.alfresco.grid.AlfrescoStoreTable'
	],
	
	mixins : {
		alfrescostoretablepanel : 'Bluedolmen.utils.alfresco.grid.AlfrescoStoreTablePanel'
	},
	
	proxyConfigOptions :  {
		extraParams : {
			rootName : 'children'
		},
		reader : {
			root : 'children'
		}
	},
	
	rootVisible : false,

	initComponent : function() {
		
		this.mixins.alfrescostoretablepanel.initComponent.apply(this, arguments);
	    this.callParent();
	    
	},	
	 	
 	destroy : function() {
 		
		this.mixins.alfrescostoretablepanel.initComponent.destroy(this, arguments); 		
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
 		
 		return store.getNodeById(id); 		
 		
 	},
 	
 	findRecord : function(fieldName, value) {
 		
 		if (null == fieldName) {
 			throw new Error('IllegalArgumentException! The provided fieldName is not valid');
 		}
 		
 		var store = this.getStore();
 		if (null == store) return null;
 		
 		var rootNode = store.getRootNode();
 		if (null == rootNode) return null;

 		return rootNode.findChild(fieldName, value, true /* deep */);
 		
 	},

 	/**
 	 * This method circumvents a problem which seems to be present in
 	 * ExtJS v.4.2 (and maybe other previous versions) which prevents
 	 * the TreeStore to be cleared with the inherited Store.removeAll()
 	 * variant.
 	 * 
 	 * @param silent
 	 */
 	clearStore : function(silent) {

 		var store = this.getStore();
 		if (null == store) return;
 		
        var rootNode = store.getRootNode();
        if (null == rootNode) return;
        
        rootNode.removeAll(); 		
 		
 	} 		
});
