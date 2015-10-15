Ext.define('Bluedolmen.utils.alfresco.grid.ContextMenuAction', {
	
	extend : 'Ext.menu.Item',
		
	text : '',
	
	config : {
		record : null
	},
	
	iconCls : null,
	
	menu : null,
	
	isAvailable : true,
	
	handler : function(item, view) {
		this.execute(this.record, item, view);
	},
	
	execute : function(record, item, view) {
		// do nothing
	}
	
});
