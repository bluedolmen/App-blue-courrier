Ext.define('Yaecma.view.navigator.Navigator', {

	requires : [
		'Yaecma.store.navigator.TreeStore'
	],
	
	extend : 'Ext.tree.Panel',
	alias : 'widget.navigator',
			
	/**
	 * @cfg {Boolean} Whether to display folders on the tree. Default to true
	 */
	showFolders : true,
	
	/**
	 * @cfg {Boolean} Whether to display files on the tree. Default to false
	 */
	showFiles : false,
	
	title : 'Navigateur',

	rootVisible : false,
	expanded : true,
	deferRowRender : false,
	
		
	initComponent : function() {
		this.store = this.getTreeStoreDefinition();
		this.callParent();
		
		this.on('selectionchange', this.onSelectionChange, this);
		this.addEvents('selectfolder');
	},
	
	getTreeStoreDefinition : function() {
		return Ext.create('Yaecma.store.navigator.TreeStore', {
			showFolders : this.showFolders,
			showFiles : this.showFiles
		});
	},
	
	/**
	 * Expand the provided nodeRef and select it.
	 * 
	 * @param {String} nodeId
	 * @param {String} parentId
	 * @param {Boolean} suppressEvent [default=false] whether to remove the selection event
	 */
	expandTo : function(nodeId, parentId, suppressEvent)  {
		
		var
			me = this,
			store = this.getStore()
		;
		
		suppressEvent = true === suppressEvent;
		
		if (null != parentId) {
			expandParent(expandAndSelectNode);
		} else {
			expandAndSelectNode();
		}
			
		function expandParent(callback) {
			var parent = store.getNodeById(parentId);
			if (!parent) return;
			
			me.expandNode(parent /* record */, false /* deep */, callback);
		}
		
		function expandAndSelectNode() {
			var node = store.getNodeById(nodeId);
			if (null == node) {
				me.getSelectionModel().deselectAll();
				return;
			}
			
			me.expandNode(node);
			me.getSelectionModel().select(node, false /* keepSelection */, suppressEvent);
			
		}
		
	},	
	
	moveTo : function(nodeId) {
		this.expandTo(nodeId);
	},
	
	onSelectionChange : function(selectionModel, selected, Opts) {
		
		if (Ext.isEmpty(selected)) return;
		var
			firstSelectedNode = selected[0],
			nodeRef = firstSelectedNode.getId()
		;
		
		if (false === this.fireEvent('selectfolder', nodeRef, firstSelectedNode)) return;
		this.expandNode(firstSelectedNode);
		
	}
	
	
	
	
});