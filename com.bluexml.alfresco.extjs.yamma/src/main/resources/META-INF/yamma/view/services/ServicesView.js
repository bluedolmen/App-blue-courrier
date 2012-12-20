Ext.define('Yamma.view.services.ServicesView', {

	extend : 'Ext.tree.TreePanel',	
	alias : 'widget.servicesview',
			
	requires : ['Yamma.store.services.ServicesTreeStore'],
	
	title : 'Services',
	iconCls : Yamma.Constants.getIconDefinition('group').iconCls,

	border : 1,
	rootVisible : false,

	initialSelection : null,

	initComponent : function() {
		this.store = this.getTreeStore();
		this.callParent();
		this.setService(this.initialSelection);
	},
	
	getTreeStore : function() {
		return Ext.create('Yamma.store.services.ServicesTreeStore');
	},
	
	setService : function(serviceShortName) {
		
		if (!serviceShortName) return;
		this.getSelectionModel().select(serviceShortName, false /* keepSelection */);
		
	},
	
	getService : function() {
		
		var 
			selectedRecords = this.getSelectionModel().getSelection(),
			firstSelectedRecord = selectedRecords[0]
		;
		
		if (!firstSelectedRecord) return null;
		return firstSelectedRecord.name;
		
	}
	
	
	
	
	
});