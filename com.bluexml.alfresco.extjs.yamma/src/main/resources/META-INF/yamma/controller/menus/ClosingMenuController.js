Ext.define('Yamma.controller.menus.ClosingMenuController', {

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
	
	onItemClick : function(view, record, item, index, event, eOpts) {

		var context = this.extractContext(record);
		if (!context) return;
		
		this.application.fireEvent('contextChanged', context);
		this.closeMenu();
		
	},
	
	extractContext : function(record) {
		return null;
	},
	
	closeMenu : function() {
		
		var mainMenu = this.getMainMenu();
		if (!mainMenu) return;
		mainMenu.collapse(Ext.Component.DIRECTION_LEFT);		
		
	}
	
	
});