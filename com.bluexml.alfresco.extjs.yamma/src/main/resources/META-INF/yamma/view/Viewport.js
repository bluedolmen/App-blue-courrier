/**
 * The main viewport definition of the Britair Client Application
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
						
						/* FOOTER */
						{
							xtype : 'yammafooter',
							region : 'south'
						}, 
						
						/* FILTERING MENU */
						{
							region : 'west',
							xtype : 'mainmenu',
							width : 250,
							minWidth : 150,
							maxWidth : 400,
							split : true,
							margin : '0 0 0 5',
							collapsible : true,
							collapsed : false
						},

						/* MAIN VIEW */
						{
							region : 'center',
							xtype : 'mainview',
							margin : '0 5 0 0'
						}
					]
				};
				
				this.callParent();
			}
			
		});