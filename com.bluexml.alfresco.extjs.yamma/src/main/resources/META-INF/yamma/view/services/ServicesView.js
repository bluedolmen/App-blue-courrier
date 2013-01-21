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
		this.selectService(this.initialSelection);
	},
	
	getTreeStore : function() {
		return Ext.create('Yamma.store.services.ServicesTreeStore');
	},

	/**
	 * 
	 * @param {} serviceShortName
	 * @public
	 */
	selectService : function(serviceShortName) {
		
		var serviceNode = this.getServiceNode(serviceShortName);
		if (!serviceNode) return;
		
		Ext.defer(
			function() {
				this.getSelectionModel().select(serviceNode, false /* keepSelection */);
			},
			10,
			this
		);
		
	},
	
	getServiceNode : function(serviceShortName) {
		
		if (!serviceShortName) return;
		
		var store = this.getStore();
		if (!store) return;
		
		var serviceNode = store.getNodeById(serviceShortName);
		return serviceNode; // may be null
		
	},	
	
	/**
	 * @return {}
	 * @public
	 */
	getSelectedService : function() {

		var firstSelectedRecord = this._getFirstSelectedRecord();

		return firstSelectedRecord ? firstSelectedRecord.get('name') : null;
		
	},
	
	/**
	 * @private
	 */
	_getFirstSelectedRecord : function() {
		
		var 
			selectedRecords = this.getSelectionModel().getSelection(),
			firstSelectedRecord = selectedRecords[0] || null
		;
		
		return firstSelectedRecord;
		
	}
	
	
	
	
	
});