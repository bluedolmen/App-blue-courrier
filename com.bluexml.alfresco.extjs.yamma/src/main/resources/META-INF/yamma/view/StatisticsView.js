Ext.define('Yamma.view.MainView',{

	extend : 'Ext.container.Container',
	alias : 'widget.mainview',
	
	requires : [
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
			xtype : 'mailsview',			
			height : '30%'
		},
		
		{
			region : 'center',
			layout : 'hbox',			
			
			defaults : {
				split : true
			},
			
			items : [
				{
					xtype : 'statisticsbyinstructorview',
					title : ''
				},
				{
					xtype : 'statisticsbystateview',
					width : '33%'
				}
			]
			
		}
	]
	
	
});