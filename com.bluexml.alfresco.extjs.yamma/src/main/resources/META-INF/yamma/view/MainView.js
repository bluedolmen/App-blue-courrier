Ext.define('Yamma.view.MainView',{

	extend : 'Ext.container.Container',
	alias : 'widget.mainview',
	
	requires : [
		'Yamma.view.menus.MainMenu',
		'Yamma.view.MailsView',
		'Yamma.view.ReferencesView',
		'Yamma.view.edit.EditDocumentView',
		'Yamma.view.charts.StatesStatsView',
		'Yamma.view.display.DisplayView'
	],	
	
	layout : 'border',
	
	defaults : {
		split : true
	},
	
	items : [
 		{
 			region : 'west',
 			layout : 'border',
 			
 			border : false,
 			width : '42%',
 			
 			defaults : {
 				split : true
 			},
 			
 			items : [
 				{
 					xtype : 'mailsview',
 					region : 'center'
 				},
 				{
 					xtype : 'editdocumentview',
 					region : 'south',
 					headerPosition : 'top',
 					frame : true,
 					height : '60%'

 				}
 			]			
 			
 		},
 		
 		{
 			region : 'center',
 			layout : 'border',			
 			border : false,
 			
 			items : [
 				{
 					xtype : 'displayview',
 					region : 'center',
 					title : '',
 					headerPosition : 'right',
 					
 					listeners : {
 						afterrender : function() {
 							
 							var height = this.getHeight();
 							this.setWidth(1.414 * height);
 							
 						}
 					}
 				}
 			]
 			
 		}
 	]	
	
//	items : [
//		{
//			region : 'north',
//			layout : 'border',
//			
//			border : false,
//			height : '30%',
//			
//			defaults : {
//				split : true
//			},
//			
//			items : [
//				{
//					xtype : 'statesstatsview',
//					region : 'east',
//					width : '25%',
//					headerPosition : 'right',
//					collapsed : false,
//					collapsible : true,
//					animCollapse : true,
//					collapseMode : 'header'
//				},
//				{
//					xtype : 'mailsview',
//					region : 'center'
//				}
//			]			
//			
//		},
//		
//		{
//			region : 'center',
//			layout : 'border',			
//			border : false,
//			
//			defaults : {
//				split : true
//			},
//			
//			items : [
//				{
//					xtype : 'displayview',
//					region : 'center',
//					title : '',
//					headerPosition : 'right'
//				},
//				{
//					xtype : 'editdocumentview',
//					region : 'east',
//					headerPosition : 'right',
//					width : '33%',
//					frame : true
//
//				}
//			]
//			
//		}
//	]
	
	
});