Ext.define('Yamma.view.menus.AdvancedSearchMenu', {

	extend : 'Ext.button.Button',
	alias : 'widget.advancedsearchmenu',
	
	text : 'Rechercher...',
	iconCls : 'icon-zoom',
	id : 'searchButton',
	
	initComponent : function() {
		this.menu = {
			items : this.getChildrenTypeItems()
		};
		
		this.callParent();
	},

	
	getChildrenTypeItems : function() {
		
		return Ext.Array.map([
				Yamma.Constants.MAIL_TYPE_DEFINITION
			],
		
			function(typeDescription) {
				
				return {
					text : typeDescription.title,
					iconCls : typeDescription.iconCls,
					typeId : typeDescription.kind
				};
				
			}
			
		);
				
	}

	
});