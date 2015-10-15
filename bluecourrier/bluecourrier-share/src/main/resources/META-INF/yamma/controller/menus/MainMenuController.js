/**
 * The controller associated to the MainMenu.
 */
Ext.define('Yamma.controller.menus.MainMenuController', {

	extend : 'Ext.app.Controller',

	uses : [
		'Yamma.utils.Context'
	],	
	
	refs : [
	
	    {
	    	ref : 'mainMenu',
	    	selector : 'mainmenu'
	    }
	    
	],
	
	currentContext : null,
	
	init: function() {
		
		this.control({
			'mainmenu': {
				contextChanged : this.onContextChanged
			}
		});
		
		this.callParent(arguments);

	},
	
	/**
	 * Used to establish a partial context (e.g., service)
	 * @param context
	 */
	onContextChanged : function(context) {
		
		this.currentContext = context; // may be null
		this.application.fireEvent('contextChanged', null);
		
		// Unselect any previously selected filter
		this.unselectExistingFilters();	

	},
	
	unselectExistingFilters : function() {
		
		var 
			mainMenu = this.getMainMenu(),
			layoutItems = mainMenu.getLayout().getLayoutItems()
		;
		
		Ext.Array.forEach(layoutItems, function(item) {
			
			var selectionModel = item.getSelectionModel ? item.getSelectionModel() : null;
			if (null == selectionModel) return;
			
			selectionModel.deselectAll();
			
		});		
		
	},
	
	onItemClick : function(view, node, item, index, event, eOpts) {

		if (!node.isLeaf()) {
			node.expand();
		}
		
		var 
			initialContext = this.currentContext || Ext.create('Yamma.utils.Context'),
			context = this.extractContext(node, initialContext)
		;
		if (!context) return;
		
		this.application.fireEvent('contextChanged', context);
		this.closeMenu();
		
	},
	
	extractContext : function(record, initialContext) {
		return null;
	},
	
	/**
	 * Close the menu if not pinned
	 */
	closeMenu : function() {
		
		var mainMenu = this.getMainMenu();
		if (!mainMenu) return;
		
		// Do not close the menu if it is pinned
		if (mainMenu.isPinned()) return;
		
		mainMenu.toggleCollapse();		
		
	}
	
	
});