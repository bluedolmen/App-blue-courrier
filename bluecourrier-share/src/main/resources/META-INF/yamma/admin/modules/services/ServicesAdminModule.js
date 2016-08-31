Ext.define('Yamma.admin.modules.services.ServicesAdminModule', {
	
    extend: 'Ext.ux.desktop.Module',

    requires: [
		'Yamma.admin.modules.services.ServicesAdminPanel'
    ],

    id : 'services-admin',
    iconCls : Yamma.utils.Constants.getIconDefinition('organization').iconCls, 
    
    
    init : function(){
        this.launcher = {
            text: i18n.t('admin.modules.services.services-admin.launcher.text'),
            iconCls : this.iconCls
        };
    },

    createWindow : function(){
    	
		var 
			me = this,
			desktop = this.app.getDesktop(),
			win = desktop.getWindow('services-admin-win')
		;
		
		if (win) return win;
		
        return desktop.createWindow({
        	
        	id : 'services-admin-win',
			title : i18n.t('admin.modules.services.services-admin.createwindow.text'),
			iconCls : me.iconCls,

			modal : true,
			height : 400,
			width : 800,
			
			layout : 'fit',
			
			items : [
				{
					header : false,
					border : false,
					xtype : 'servicesadminpanel'
				}
			], 

			animCollapse : false,
			constrainHeader : true

        });
        
	}
});