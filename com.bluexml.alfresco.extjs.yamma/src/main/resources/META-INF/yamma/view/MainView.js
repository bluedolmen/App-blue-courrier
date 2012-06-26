Ext.define('Yamma.view.MainView',{

	extend : 'Ext.container.Container',
	alias : 'widget.mainview',
	
	requires : [
		'Yamma.view.header.Header',
		'Yamma.view.Footer',
		'Yamma.view.menus.MainMenu',
		'Yamma.view.MailsView',
		'Yamma.view.ReferencesView',
		'Yamma.view.DisplayView',
		'Yamma.view.EditDocumentView'
	],	
	
	layout : 'border',
	
	defaults : {
		split : true
	},
	
	items : [
		{
			region : 'north',
			layout : 'border',
			
			border : false,
			height : '30%',
//			margin : '0 0 4 0',	
			
			defaults : {
				split : true
			},
			
			items : [
				{
					xtype : 'mailsview',
//					padding : '0 2 0 0',
					region : 'center'
				},
				{
					xtype : 'referencesview',
//					padding : '0 0 0 2',
					frame : true,
					region : 'east',
					headerPosition : 'right',
					width : '35%',
					collapsed : false,
					collapsible : true,
					animCollapse : true
					
				}
			]			
			
		},
		
		{
			region : 'center',
			layout : 'border',			
			border : false,
			
			defaults : {
				split : true
			},
			
			items : [
				{
					xtype : 'displayview',
					region : 'center',
//					padding : '0 2 0 0',
					title : '',
					headerPosition : 'right'
				},
				{
					xtype : 'editdocumentview',
					region : 'east',
//					padding : '0 0 0 2',					
					headerPosition : 'right',
					width : '35%',
					frame : true

				}
			]
			
		}
	]
	
	
});