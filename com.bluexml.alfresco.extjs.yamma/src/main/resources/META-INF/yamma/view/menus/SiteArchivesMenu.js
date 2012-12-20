Ext.define('Yamma.view.menus.SiteArchivesMenu', {

	extend : 'Ext.tree.Panel',
	alias : 'widget.sitearchivesmenu',
	
	requires : ['Yamma.store.menus.SiteArchivesTreeStore'],
			
	id : 'sitearchives-menu',
	
	title : 'Archives',
	iconCls : Yamma.Constants.getIconDefinition('package').iconCls,

	border : 1,
	rootVisible : false,
	hidden : true,
	
	initComponent : function() {
		this.store = this.getTreeStore();
		
		this.mon(this.store, 'load', this.onStoreLoad /* callback */, this /* scope */);

		// This event listener avoid propagation of the show event and avoid
		// expanding the panel in the accordion layout
		this.mon(this, 'show', function(thisComponent, eOpts) {
			return false;
		});
		this.callParent();
	},
	
	/**
	 * @private
	 */
	onStoreLoad : function(store, records, successful, operation) {
		
		if ('root' != records.getId()) return;
		if (records.childNodes.length == 0) return;
		
		this.show();
		this.mun(this.store, 'load', this.onStoreLoad);
	},
		
	getTreeStore : function() {
		return Ext.create('Yamma.store.menus.SiteArchivesTreeStore');
	}
	
});