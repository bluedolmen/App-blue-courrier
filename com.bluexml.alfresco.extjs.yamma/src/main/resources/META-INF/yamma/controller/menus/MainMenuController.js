Ext.define('Yamma.controller.menus.MainMenuController', {
	extend : 'Ext.app.Controller',
	
	refs : [
	    {
			ref : 'mailsView',
	    	selector : 'mailsview'
	    },
	    
	    {
	    	ref : 'mainMenu',
	    	selector : 'mainmenu'
	    }
	],
	
	init: function() {
		
		this.control({
			'mainmenu': {
				itemclick : this.onItemClick
			}
		});
		
	},
	
	onItemClick : function(view, record, item) {
		
		var type = record.get('type');
		if ('tray' != type) return;
		
		var id = record.get('id');
		var trayName = record.get('text');
		
		this.displayTrayContent(id, trayName);
		
	},
	
	displayTrayContent : function(trayNodeRef, trayName) {
		
		var mailsView = this.getMailsView();
		if (!mailsView) return;
		
		mailsView.filter({
			
			meta : {
				ref : trayName
			},
			
			filters : [
	    		{
	    			id : 'trayNodeRef',
	    			value : trayNodeRef
	    		}
			]
			
		});
		
		var mainMenu = this.getMainMenu();
		if (!mainMenu) return;
		mainMenu.collapse(Ext.Component.DIRECTION_LEFT);
		
	}	
	
});