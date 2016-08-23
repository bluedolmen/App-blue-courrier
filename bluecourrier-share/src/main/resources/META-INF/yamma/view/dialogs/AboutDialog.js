Ext.define('Yamma.view.dialogs.AboutDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.aboutdialog',
	
	uses : [
	    'Yamma.utils.LicenseManager'
	],
	
	UPDATE_LICENSE_WS_URL : 'alfresco://bluedolmen/yamma/license/bluecourrier',
	
	statics : {
		
		INSTANCE : null,
		getInstance : function() {
			if (null == this.INSTANCE) {
				this.INSTANCE = Ext.create('Yamma.view.dialogs.AboutDialog');
			}
			return this.INSTANCE;
		}
		
	},
	
	title : i18n.t('view.dialog.aboutdialog.title'),
	minHeight : 300,
	width : 450,
	modal : true,
	closeAction : 'hide',
	
	layout : 'vbox',
	
	imgSrc : '/alfresco/service/bluedolmen/yamma/logo.png',
	
	defaults : {
		margin : 10,
		flex : 1,		
		width : '100%',
		border : 1
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initComponent : function() {
		
		var
			me = this,
			html, svnrev, version,
			templateConfig,
			LM = Yamma.utils.LicenseManager
		;
		
		this.dockedItems = [{
	        xtype: 'toolbar',
	        dock: 'top',
	        itemId : 'licenceAdminMenu',
	        hidden : true,
	        items: [
	            '->',
	            {
	            	xtype : 'button',
	            	text : i18n.t('view.dialog.aboutdialog.dockedItem.button.license'),
	            	iconCls : Yamma.Constants.getIconDefinition('rosette').iconCls,
	            	menu : {
//	            		floating : false,
	            		plain : true,
	            		items : [
	            		    {
	            		    	text : i18n.t('view.dialog.aboutdialog.dockedItem.button.menu.update'),
	            		    	iconCls : Yamma.Constants.getIconDefinition('page_white_go').iconCls,
	            		    	handler : uploadLicenseFile
	            		    }
	            		]
	            	}
	            	
	            	
	            }
	        ]
		}];
		
		
		function uploadLicenseFile() {
			
			var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
				me.UPDATE_LICENSE_WS_URL
			);
			
			Ext.create('Yamma.view.windows.UploadFormWindow', {
				
				title : i18n.t('view.dialog.aboutdialog.uploadwindow.title'),
				
				formConfig : {
					uploadUrl : url + '?format=html', // force html response format due to ExtJS form submission restriction
					fileFieldName : 'license',
					additionalFields : [{
						name : 'override',
						value : true
					}]
				},
				
				onSuccess : function(response) {
					
					Ext.MessageBox.show({
						
						title : i18n.t('view.dialog.aboutdialog.uploadwindow.updated.title'),
						icon : Ext.MessageBox.INFO,
						msg: i18n.t('view.dialog.aboutdialog.uploadwindow.updated.msg'),
						width:300,
						buttons: Ext.MessageBox.OKCANCEL,
						fn : function(button) {
							
							if ('ok' != button) return;
							window.location.reload();
							
						}
							
					});
					
				},
				
				onFailure : function(form, action) {
					
					Ext.MessageBox.show({
						title : i18n.t('view.dialog.aboutdialog.uploadwindow.failed.title'),
						msg : i18n.t('view.dialog.aboutdialog.uploadwindow.failed.msg'),
						icon : Ext.MessageBox.ERROR,
						buttons: Ext.MessageBox.OK
					});
					
					return false; // omit the default behaviour
					
				}
				
			}).show();
			
		}
		
		this.aboutTemplate = new Ext.XTemplate(
			'<div class="about-dialog">',
				'<div class="image">', '<img src="' + this.imgSrc + '" />', '</div>',
				'<div class="version">',
					'<div class="main">v. {version}</div>',
					'<div class="revision">rév. {revision}</div>',
					'<div class="date">{buildDate}</div>',
				'</div>',
				'<div class="details">',
					'<div><span class="application-name">{applicationName}</span><span> (Version <emph>{licenseMode}</emph>)</span></div>',
					'<div class="description">{description}</div>',
				'</div>',
				'<div class="license {licenseModeClass}">',
					'<div class="validity {licenseValidityImage}"></div>',
					'<div>Accordée à <emph>{licenseHolder}</emph></div>',
					'<div>Jusqu\'au <emph>{licenseValidUntil}</emph></div>',
					'<div>Identifiant licence : <emph>{licenseId}</emph></div>',
				'</div>',
			'</div>'
		);
		
		svnrev = Yamma.config.client['application.svnrev'];
		if (!svnrev || -1 != svnrev.indexOf('$')) { // fallback on revision
			svnrev = Yamma.config.client['application.revision'];
		}
		
		version = Yamma.config.client['application.full-version'];
		if (!version || -1 != version.indexOf('$')) {
			version = Yamma.config.client['application.version'];
		}
		
		templateConfig = {
				
			applicationName : Yamma.config.client['application.name'],
			description : Yamma.config.client['application.description'],
			version : version,
			revision : svnrev,
			buildDate : Yamma.config.client['application.build-date'],
			licenseMode : 'community',
			licenseModeClass : Ext.baseCSSPrefix + 'hide-display'
			
		};
		
		if (LM.isEnterpriseEdition()) {
		
			var 
				holder = LM.getHolder(),
				isExpired = LM.isLicenseExpired(true /* silent */),
				validUntil = LM.getValidUntil()
			;
			
			templateConfig.licenseModeClass = (isExpired ? 'expired' : '');
			
			Ext.apply(templateConfig, {
				
				licenseMode : LM.ENTERPRISE_EDITION,
				licenseHolder : holder,
				licenseValidUntil : ' <span ' + (isExpired ? 'class="expired"' : '') + '>'
					+ validUntil
					+ (isExpired ? ' (expirée)' : '')
					+ '</span>',
				licenseId : LM.getLicenseId(),
				licenseValidityImage : LM.isLicenseValid(true /* silent */) ? 'icon-license-valid' : 'icon-license-invalid' 
				
			});
			
		}
		
		html = this.aboutTemplate.apply(templateConfig);
		
		this.items = [
		    {
				xtype : 'component',
				html : html
		    }
		];
		
		this.callParent();
		
		// Set the admin-menu visible if necessary
		Bluedolmen.Alfresco.getCurrentUser(
				
			function onUserAvailable(currentUser) {
				
				if (!currentUser.isApplicationAdmin()) return;
//				if ('community' == templateConfig.licenseMode) return;
				if ("true" != Yamma.config["licenseable"] && !LM.isEnterpriseEdition()) return;
					
				var adminMenu = me.queryById('licenceAdminMenu');
				if (null == adminMenu) return;
				adminMenu.setVisible(true);
				
			}
			
		);

	},
	
	close : function() {
		
		this.callParent();
		
		/*
		 * Do not allow to close the window.
		 * This may be circumvent easily.
		 * An easier way is to switch back to the community version, the enterprise
		 * one being just a supported version.
		 */
		if (Yamma.utils.LicenseManager.isLicenseExpired(true /* silent */)) {
			
//			Yamma.view.dialogs.AboutDialog.getInstance().close();
			Ext.MessageBox.show({
				title : i18n.t('view.dialog.aboutdialog.uploadwindow.expired.title'),
				icon : Ext.MessageBox.INFO,
				msg : i18n.t('view.dialog.aboutdialog.uploadwindow.expired.msg'),
				modal : true,
				toFrontOnShow : true
			}, function() {
				
			});
			
//			return;
			
		}
		
		
	}
	
});