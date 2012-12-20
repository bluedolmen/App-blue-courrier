Ext.define('Yamma.view.menus.SiteTraysMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.sitetraysmenu',
			
	requires : ['Yamma.store.menus.SiteTraysTreeStore'],
	
	id : 'sitetrays-menu',
	
	title : 'Bannettes',
	iconCls : 'icon-folder_page_white',

	border : 1,
	rootVisible : false,
	
	initComponent : function() {
		this.store = this.getTreeStore();
		this.callParent();
	},
	
	getTreeStore : function() {
		return Ext.create('Yamma.store.menus.SiteTraysTreeStore');
	}
	
});