/**
 * The main viewport definition of the YaMma Client Application
 */
Ext.define('Yamma.view.Viewport', {
	
	extend : 'Ext.container.Viewport',
	
	requires : [
		'Ext.layout.container.Border',
		'Yamma.view.header.Header',
		'Yamma.view.menus.MainMenu',
		'Yamma.view.MainView',				
		'Yamma.view.Footer'
	],
	
	layout : 'fit',
	
	initComponent : function() {
		
		this.items = {
			id : 'yamma-app',
			layout : 'border',
			items : [
				
				/* HEADER */
				{
					xtype : 'yammaheader',
					region : 'north',
					height : 50,
					margin : 5	
				},
				
				/* MAIN VIEW */
				{
					region : 'center',
					xtype : 'mainview',
					margin : '0 5 10 5'
				}
			]
		};
		
		this.callParent();
	}
	
});