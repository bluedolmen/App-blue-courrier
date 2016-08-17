// THIS IS UNUSED YET
Ext.define('Yamma.admin.modules.directory.DirectoryAdminModule', {
	
    extend: 'Ext.ux.desktop.Module',

    requires: [
    ],

    id : 'directory-admin',
    iconCls : Yamma.utils.Constants.getIconDefinition('organization').iconCls, 
    
    
    init : function(){
        this.launcher = {
            text: i18n.t('admin.modules.directory.launcher.text'), //'Aministration des contacts',
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
			title : i18n.t('admin.modules.directory.launcher.text'),//'Administration des services',
			iconCls : me.iconCls,

			modal : true,
			height : 400,
			width : 400,
			
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