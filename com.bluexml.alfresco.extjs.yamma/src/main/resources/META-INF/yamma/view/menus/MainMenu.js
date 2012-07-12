Ext.define('Yamma.view.menus.MainMenu', {
	
	extend : 'Ext.panel.Panel',
	alias : 'widget.mainmenu',
	
	requires : [
		'Yamma.view.menus.SiteTraysMenu',
		'Yamma.view.menus.MyMenu'
	],
	
	id : 'main-menu',
	title : 'Menu principal',
	
	layout : 'accordion',
    layoutConfig: {
        // layout-specific configs go here
        titleCollapse: false,
        animate: true,
        activeOnTop: true
    },
    
    items : [
	    {
	    	xtype : 'mymenu'
	    	
	    },
	    {
	    	xtype : 'sitetraysmenu'
	    }
    ]
				
});