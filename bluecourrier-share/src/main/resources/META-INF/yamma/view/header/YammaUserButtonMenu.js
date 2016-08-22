Ext.define('Yamma.view.header.YammaUserButtonMenu', {
	
	extend : 'Bluedolmen.utils.alfresco.button.UserButtonMenu',
	alias : 'widget.yammauserbuttonmenu',
	
	requires : [
		'Yamma.utils.SignatureUtils',
		'Yamma.view.dialogs.AboutDialog'
	],
	
	uses : [
		'Yamma.view.digitalsigning.SignatureManagementWindow'
	],

	statics : {
		STATISTICS_URL : '/stats/bluecourrier',
		DATALISTS_URL : '/share/page/site/{configSiteName}/data-lists',
		LABEL_GENERATOR_URL : 'alfresco://bluedolmen/yamma/label-generator?pageNumber={pageNumber}'
	},
	
	getAdditionalMenuItems : function(currentUser) {
		
		return Ext.Array.clean([
//			this.getCodeBarGeneratorMenuItemDeclaration(),
			this.getSignatureManagementDeclaration(),
			this.getAboutItemDeclaration()
		].concat(this.getAdminsMenuItems(currentUser)));
		
	},
	
	getAdminsMenuItems : function(currentUser) {
		
		if (!currentUser.isApplicationAdmin()) return [];
		
		return [
			this.getDataListsMenuItemDeclaration(),
			this.getStatisticsMenuItemDeclaration(),
			this.getServicesAdministrationItemDeclaration()
		];
		
	},
	
	getDataListsMenuItemDeclaration : function() {
		
		return ({
			itemId : 'datalists-management',
			text : i18n.t('view.header.userbutton.items.datalist-management'),
			iconCls : Yamma.Constants.getIconDefinition('text_list_bullets').iconCls,
			listeners : {
				click : this.onDataListsMenuItemClicked
			}			
		});
		
		
	},
	
	onDataListsMenuItemClicked : function() {
		
		var 
			url = Yamma.view.header.YammaUserButtonMenu.DATALISTS_URL
				.replace(/\{configSiteName\}/, Yamma.Constants.CONFIG_SITE_SHORTNAME)
		;
			
		window.open(url);
		
	},
	
	getStatisticsMenuItemDeclaration : function() {
		
		return ({
			itemId : 'global-statistics',
			text : i18n.t('view.header.userbutton.items.global-statistics'),
			iconCls : Yamma.Constants.getIconDefinition('chart_curve').iconCls,
			listeners : {
				click : this.onStatisticsMenuItemClicked
			}			
		});
		
	},
	
    onStatisticsMenuItemClicked : function() {
    	
    	var statisticsUrl = Yamma.config.client['application.statistics-url'];
    	window.open(statisticsUrl || Yamma.view.header.YammaUserButtonMenu.STATISTICS_URL);
    	
    },
	
	getCodeBarGeneratorMenuItemDeclaration : function() {
		
		return ({
			itemId : 'label-generator',
			text : i18n.t('view.header.userbutton.items.label-generator'),
			iconCls : Yamma.Constants.getIconDefinition('stock_id').iconCls,
			listeners : {
				click : this.onCodeBarGeneratorMenuItemClicked
			}			
		});
		
	},
	
	onCodeBarGeneratorMenuItemClicked : function() {
		
		Ext.Msg.prompt(
			i18n.t('view.header.userbutton.codebarprompt.title'),
			i18n.t('view.header.userbutton.codebarprompt.message'),
			function(button, text) {
				if ('ok' != button) return;
				if (isNaN(parseInt(text))) return; // ignore for the moment
				
				var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
					Yamma.view.header.YammaUserButtonMenu.LABEL_GENERATOR_URL.replace(
						'\{pageNumber\}', text
					)
				);
				window.open(url);
			},
			this, /* scope */
			false, /* multiline */
			'1' /* default */
		);
		
	},
	
	getSignatureManagementDeclaration : function() {
		
		if (!Yamma.utils.SignatureUtils.isFeatureAvailable()) return null;
		
		return ({
			itemId : 'signature-management',
			text : i18n.t('view.header.userbutton.items.signature-management'),
			iconCls : Yamma.Constants.getIconDefinition('text_signature').iconCls,
			listeners : {
				click : this.onSignatureManagementMenuItemClicked
			}			
		});		
		
	},
	
	onSignatureManagementMenuItemClicked : function() {
		
		var window = Ext.create('Yamma.view.digitalsigning.SignatureManagementWindow');
		window.show();
		
	},
	
	getServicesAdministrationItemDeclaration : function() {
		
		return ({
				itemId : 'bluecourrier-administration',
				text : i18n.t('view.header.userbutton.items.bluecourrier-administration'),
				iconCls : Yamma.Constants.getIconDefinition('tools').iconCls,
				listeners : {
					
					click : function() {
						window.open('/share/page/yamma-admin');
					}
					
				}			
		});		
		
	},
	
	getAboutItemDeclaration : function() {
		
		return ({
				itemId : 'about-application',
				text : i18n.t('view.header.userbutton.items.about-application'),
				iconCls : Yamma.Constants.getIconDefinition('information').iconCls,
				listeners : {
					
					click : function() {
						
						Yamma.view.dialogs.AboutDialog.getInstance().show();
						
					}
					
				}			
		});		
		
	}

	
//	onServicesAdministrationMenuItemClicked : function() {
//		
//		Ext.create('Ext.window.Window', {
//			
//			title : 'Administration des services',
//			
//			modal : true,
//			height : 400,
//			width : 400,
//			
//			layout : 'fit',
//			
//			items : [
//				{
//					header : false,
//					border : false,
//					xtype : 'servicesadminpanel'
//				}
//			], 
//			
//			renderTo : Ext.getBody()
//		}).show();		
//		
//	}
	
});
