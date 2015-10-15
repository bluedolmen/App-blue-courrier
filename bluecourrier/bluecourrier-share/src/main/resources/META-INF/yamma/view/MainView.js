Ext.define('Yamma.view.MainView',{

	extend : 'Ext.container.Container',
	alias : 'widget.mainview',
	
	requires : [
		'Yamma.view.menus.MainMenu',
		'Yamma.view.mails.MailsView',
		'Yamma.view.mails.MailFiltersView',
		'Yamma.view.mails.TasksView',
		'Yamma.view.mails.ThreadedView',
		'Yamma.view.ReferencesView',
		'Yamma.view.edit.EditDocumentView',
		'Yamma.view.display.DisplayView',
		
		'Ext.tab.Panel'
	],	
	
	layout : 'border',
	
	defaults : {
		split : true
	},
	
	initComponent : function() {
		
		this.items = this._getItems();
		this.callParent(arguments);
		
	},
	
	_getItems : function() {
		
		var items = [
	  		{
	  			region : 'west',
	  			layout : 'border',
	  			
	  			border : false,
	  			width : '60%',
	  			
	  			defaults : {
	  				split : true
	  			},
	  			
	  			items : [
	  			    {
	  			    	xtype : 'tabpanel',
	  			    	tabPosition : 'left',
	  			    	region : 'center',
	  			    	id : 'mailsviewtabpanel',
	  			    	items : [
	 		 				{
	 		 					xtype : 'tasksview',
	 		 					title : 'Tâches',
	 		 					id : 'mailtasksview'
	 		 				},
	 		 				{
	 		 					xtype : 'panel',
	 		 					id : 'searchpanel',
	 		 					title : 'Rechercher',
	 		 					layout : 'border',
	 		 					margin : 0,
	 		 					defaults : {
	 		 						height : '100%',
	 		 						border : 0,
	 		 						margin : 0
	 		 					},
	 		 					items : [
	 		 					    {
	 		 					    	xtype : 'mailfiltersview',
	 		 					    	id : 'mailfiltersview',
	 		 					    	region : 'west',
	 		 					    	width : 250,
	 		 		 					autoScroll : true,
	 		 		 					border : '0 1 0 0',
			 		 					split : true,
	 		 		 					style : {
	 		 		 						borderStyle : 'solid',
	 		 		 						borderColor : '#99bce8'
	 		 		 					}
	 		 					    },
 			 		 				{
 			 		 					xtype : 'mailsview',
 			 		 					region : 'center',
 			 		 					headerPosition : 'right',
 			 		 					title : 'Courriers',
 			 		 					id : 'servicemailsview',
 			 		 					flex : 1
 			 		 				}
	 		 					]
	 		 				}
	 					]
	  			    },
	  				{
	  					xtype : 'editdocumentview',
	  					region : 'south',
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
	  					headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	  					
	  					listeners : {
	  						afterrender : function() {
	  							
	  							var height = this.getHeight();
	  							this.setWidth(1.414 * height);
	  							
	  						}
	  					}
	  				}
	  			]
	  			
	  		}
	  	];
		
		if ('undefined' != typeof AdvancedCommunicationSpace && !Ext.isEmpty(AdvancedCommunicationSpace.url) ) {
			
			var
				config = Ext.applyIf(AdvancedCommunicationSpace, {
					region : 'east',
					src : AdvancedCommunicationSpace.url
				})
			;
			
			if (!config.height && !config.width) {
				config.width = '200px';
			}

			items.push(Ext.create('Ext.ux.ManagedIframe.Component', Ext.apply({
				autoScroll : false
			}, config)));
			
		}
		
		return items;
		
	}
	
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