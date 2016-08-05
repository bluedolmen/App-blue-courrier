Ext.define('Yamma.view.services.ServicesView', {

	extend : 'Ext.tree.Panel',	
	alias : 'widget.servicesview',
			
	requires : [
		'Yamma.store.services.ServicesTreeStore',
		'Ext.ux.tree.plugin.NodeDisabled'
	],
	
	title : 'Services',
	iconCls : Yamma.Constants.getIconDefinition('group_mail').iconCls,

	border : 1,
	rootVisible : false,
	preload : true,
	
	showDisabled : false,
	storeConfig : null,

	initialSelection : null,
	allowMultipleSelection : false,

	initComponent : function() {
		
		this.columns = this.getColumns();
		this.store = this.getTreeStore();
		
		if (true === this.showDisabled) {
			
			this.plugins = this.plugins || []; 
	    	this.plugins.push({
	    		ptype: 'dvp_nodedisabled',
	    		preventSelection : true
	        });
			
		}
		
		if (true == this.allowMultipleSelection && !this.selModel) {
			this.selModel = Ext.create('Ext.selection.RowModel',{
		    	mode : 'MULTI'
		    });
		}
		
		this.callParent();
		this.selectService(this.initialSelection);
	},
	
	hideHeaders : true,
	
	getColumns : function() {
		return [{
			xtype: 'treecolumn', //this is so we know which column will show the tree
			text: 'Service',
			flex: 2,
			sortable: true,
			dataIndex: 'text'
		}];
	},
	
	getTreeStore : function() {
		var servicesStore = Ext.create('Yamma.store.services.ServicesTreeStore', this.storeConfig || {});
		if (true === this.preload) {
			// pre-load the store (bug extjs 4.2.1 => the store won't be loaded without this)
			servicesStore.load(); 			
		}
		
		return servicesStore;
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
	getSelectedServiceName : function() {

		var selectedService = this.getSelectedServiceNode();
		if (!selectedService) return null;
		
		return selectedService.get('name');
		
	},
	
	getSelectedServiceNames : function() {

		var selectedServices = this.getSelectedServiceNodes();
		return Ext.Array.clean(Ext.Array.map(selectedServices, function(selectedService) { return selectedService.get('name'); }));
		
	},
	
	
	getSelectedServiceNode : function() {

		var selectedRecords = this.getSelectedServiceNodes();
		return selectedRecords[0] || null;
		
	},
	
	getSelectedServiceNodes : function() {
		
		var selectedRecords = this.getSelectionModel().getSelection() || [];
		return selectedRecords;
		
	},
	
	/**
	 * @private
	 */
	_getFirstSelectedRecord : function() {
		
		return firstSelectedRecord;
		
	}
	
	
	
	
	
});