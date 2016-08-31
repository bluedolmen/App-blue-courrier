Ext.define('Yamma.view.menus.MainMenu', {
	
	extend : 'Ext.panel.Panel',
	alias : 'widget.mainmenu',
	
	requires : [
		'Ext.layout.container.Accordion',
		'Yamma.view.menus.MyMenu',
		'Yamma.view.menus.SiteTraysMenu',
		'Yamma.view.menus.SiteArchivesMenu'
	],
	
	id : 'main-menu',
	title : i18n.t('view.menu.mainmenu.title'),
	
	/**
	 * Store the state of the panel w.r.t. the pin/unpin actions
	 * @type Boolean
	 */
	pinned : false,
	
	layout : 'accordion',
    layoutConfig: {
        // layout-specific configs go here
        titleCollapse: false,
        animate: true,
        activeOnTop: true
    },
    
    tools : [
	    {
	    	itemId : 'unpin',
	    	type : 'unpin',
	    	handler : function(event, target, owner, tool) {
	    		this.hide();
	    		owner.child('#pin').show();
	    		owner.up('panel').pinned = true;
	    	}
	    },
	    {
	    	itemId : 'pin',
	    	type : 'pin',
	    	hidden : true,
	    	handler : function(event, target, owner, tool) {
	    		this.hide();
	    		owner.child('#unpin').show();
	    		owner.up('panel').pinned = false;
	    	}
	    }
    ],
    
    items : [
	    {
	    	xtype : 'sitetraysmenu'
	    },
	    {
	    	xtype : 'sitearchivesmenu'
	    },
	    {
	    	xtype : 'mymenu'
	    }
    ],
    
    isPinned : function() {
    	return this.pinned;
    }
				
});