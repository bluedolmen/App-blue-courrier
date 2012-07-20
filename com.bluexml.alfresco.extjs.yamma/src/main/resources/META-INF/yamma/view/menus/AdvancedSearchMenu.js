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
		
		var yammaDocumentTypeNames = Ext.Object.getKeys(Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS);
		
		return Ext.Array.map(yammaDocumentTypeNames,
		
			function(yammaDocumentTypeName) {
				
				var typeDescription = Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[yammaDocumentTypeName];
				
				return {
					text : typeDescription.title || yammaDocumentTypeName,
					iconCls : typeDescription.iconCls,
					typeId : yammaDocumentTypeName
				};
				
			}
			
		);
				
	}

	
});