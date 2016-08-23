Ext.define('Yamma.admin.modules.services.SitesAdminWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.sitesadminwindow',
	
	requires : [
		'Yamma.admin.modules.services.SitesAdminUtils'
	],
				
	SET_AS_SERVICE_URL : 'alfresco://bluedolmen/yamma/services',
	
	title : i18n.t('admin.modules.services.siteadminwindow.title'),//'Administration des Sites',
	iconCls : Yamma.Constants.getIconDefinition('group').iconCls,

	border : 1,
	height : 300,
	width : 600,
	
	layout : 'border',
	defaults : {
		flex : 1
	},
	renderTo : Ext.getBody(),
	
	availableSites : null,
	
	initComponent : function() {
		
		this.addEvents('new-service');		
		
		if (null == this.availableSites) {
			Ext.Error.raise( i18n.t('admin.modules.services.siteadminwindow.error.servicestore') );
		}

		var
			me = this,
			
			sitesStore = Ext.create('Ext.data.Store', {
				fields : ['shortName', 'title', 'description'],
				data : this.availableSites
			}),
			
			sitesGrid = Ext.create('Ext.grid.Panel', {
				region : 'center',
				hideHeaders : true,
				columns : [
					{ text : i18n.t('admin.modules.services.siteadminwindow.site.grid.columns.title'), dataIndex : 'title', flex : 1},
					{ 
						xtype : 'actioncolumn', 
						width : 30,
						items: [{
							icon: Yamma.Constants.getIconDefinition('add').icon,
							tooltip: i18n.t('admin.modules.services.siteadminwindow.site.grid.columns.actionscolumn'),
							handler: addAsServiceHandler
						}]
					}
				],
				store : sitesStore
			}),
			
			createSiteForm = Ext.create('Yamma.admin.modules.services.CreateServiceForm', {
			    bodyPadding: 5,
			    region : 'east'
			});			
		;
		
		this.items = [
			sitesGrid,
			createSiteForm
		];							
		
		this.callParent();
		
		function addAsServiceHandler(grid, rowIndex, colIndex) {
			var 
				record = grid.getStore().getAt(rowIndex),
				siteShortName = record.get('shortName')
			;
			
			Yamma.admin.modules.services.SitesAdminUtils.setAsService(
				siteShortName, 
				{}, /* serviceDefinition */
				{
					onSuccess : function() {
						sitesStore.removeAt(rowIndex);
						me.fireEvent('new-service', siteShortName);
					}
				} /* config */
			);
		}
		
	}
		
	
});