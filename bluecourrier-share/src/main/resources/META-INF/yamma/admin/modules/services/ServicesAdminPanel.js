Ext.define('Yamma.admin.modules.services.ServicesAdminPanel', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.servicesadminpanel',
			
	requires : [
		'Yamma.store.services.ShareSites',
		'Yamma.admin.modules.services.SitesAdminUtils',
		'Ext.tree.plugin.TreeViewDragDrop',
		'Yamma.admin.modules.services.ServicesView',
		'Ext.form.field.ComboBox',
		'Yamma.admin.modules.services.MembersAdminPanel'
	],
	
	uses : [
		'Yamma.admin.modules.services.SitesAdminWindow',
		'Bluedolmen.windows.ConfirmDialog',
		'Yamma.admin.modules.services.CreateServiceForm'
	],
	
	title : i18n.t('admin.modules.services.servicesadminpanel.title'),
	iconCls : Yamma.Constants.getIconDefinition('group').iconCls,	
	
	layout : 'border',
	
	initComponent : function() {
		
		var me = this;
		
		function isSiteDefinedAsService(siteShortName) {
			return me.servicesView.getStore().getById(siteShortName);
		}
		
		var sitesCombo = Ext.create('Ext.form.field.ComboBox', {
			DATASOURCE_URL : 'alfresco://api/sites',
			
			minChars : 3,
		    fieldLabel: 'Sites',
		    labelWidth : 30,
		    queryMode: 'remote',
		    queryParam: 'nf',
		    displayField : 'title',
		    valueField: 'shortName',
		    hideTrigger : true,
		    width : 300,
		    grow : true,
		    
		    listConfig: {
				loadingText: i18n.t('admin.modules.services.servicesadminpanel.message.searching'),
				emptyText: i18n.t('admin.modules.services.servicesadminpanel.message.nosite')
			},
			
			store : Ext.create('Yamma.store.services.ShareSites', {
				filters: [
				    function(item) {
				    	var siteShortName = item.getId();
				        return !isSiteDefinedAsService(siteShortName);
				    }
				]			
			}),
			
			listeners : {
				
				select : function(combo, records, e) {
					if (records.length == 0) return;
					
					var 
						firstRecord = records[0],
						siteShortName = firstRecord.get('shortName')
					;
					
					combo.clearValue();
					me.addSiteAsService(siteShortName);
					
				},
				
				specialkey: function(field, e) {
					if (e.getKey() != e.ENTER) return;
					
					var siteShortName = field.getValue();
					if (isSiteDefinedAsService(siteShortName)) return;
					if (field.store && null != field.store.getById(siteShortName)) return; // already taken into account by select event
					
					field.clearValue();
					me.createNewService(siteShortName);
					
				}
				
			}
		    
		});
		
		this.servicesView = Ext.create('Yamma.admin.modules.services.ServicesView', {
			tbar : [
				sitesCombo
			],
			region : 'center',
			flex : 2,
			header : false,
			border : false,
			
			listeners : {
				'itemclick' : function(table, record, item, index, e, eOpts) {
					this.onServiceSelection(record);
				},
				scope : this
			}
		});
		
		this.membersView = Ext.create('Yamma.admin.modules.services.MembersAdminPanel', {
			flex : 3,
			header : false,
			border : false,
			region : 'east',
			collapsible : true,
			margin : '0 5 5 5'
		});
 		
		this.items = [
			this.servicesView,
			this.membersView
		];
		
		this.callParent();
		
	},
	
	onServiceSelection : function(record) {
		
		var serviceName = record.get('id');
		this.membersView.updateMembers('site_' + serviceName);
		
	},
	
	refreshServicesView : function() {
		this.servicesView.refreshView();
	},
	
	addSiteAsService : function(siteShortName) {
		
		var me = this;
		
		Bluedolmen.windows.ConfirmDialog.FR.askConfirmation(
			i18n.t('admin.modules.services.servicesadminpanel.dialog.addservice.confirm.title'),
			i18n.t('admin.modules.services.servicesadminpanel.dialog.addservice.confirm.message.1') + siteShortName + i18n.t('admin.modules.services.servicesadminpanel.dialog.addservice.confirm.message.2'),
			onConfirmation
		);
		
		function onConfirmation() {
			
			Yamma.admin.modules.services.SitesAdminUtils.setAsService(
				siteShortName, 
				{}, /* serviceDefinition */
				{
					onSuccess : function() {
						me.refreshServicesView();
					}
				} /* config */
			);
			
		}
		
	},
	
	createNewService : function(siteShortName) {

		var
		
			me = this,
			
			createServiceForm = Ext.create('Yamma.admin.modules.services.CreateServiceForm',{
				title : false,
				listeners : {
					'new-service' : function() {
						me.refreshServicesView();
						createServiceWindow.close();
					}
				}
			}),
			
			form = createServiceForm.getForm(),
			
			createServiceWindow = Ext.create('Ext.window.Window', {
			
				title : i18n.t('admin.modules.services.servicesadminpanel.dialog.createservice.window.title'),
				width : 300,
				height : 300,
				renderTo : Ext.getBody(),
				layout : 'fit',
				
				items : [
					createServiceForm
				]
			
			})
			
		;
		
		form.setValues({
			shortName : siteShortName,
			title : siteShortName
		});
		
		createServiceWindow.show();
		
	}
	
});
