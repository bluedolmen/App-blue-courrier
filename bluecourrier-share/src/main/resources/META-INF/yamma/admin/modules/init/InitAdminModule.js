Ext.define('Yamma.admin.modules.init.InitAdminModule', {
	
    extend: 'Ext.ux.desktop.Module',

    requires: [
    	'Yamma.admin.modules.init.InitAdminPanel'
    ],

    id : 'init-admin',
    iconCls : Yamma.utils.Constants.getIconDefinition('gear').iconCls, 
    
    
    init : function(){
        this.launcher = {
            text: i18n.t('admin.modules.init.actions.launcher.text'),//"Initialisation de l'application",
            iconCls : this.iconCls
        };
    },

    createWindow : function(){
    	
		var 
			me = this,
			desktop = this.app.getDesktop(),
			win = desktop.getWindow('init-admin-win')
		;
		
		if (win) return win;
		
        return desktop.createWindow({
        	
        	id : 'init-admin-win',
			title : i18n.t('admin.modules.init.actions.window.title'),//'Initialisation de l\'application',
			iconCls : me.iconCls,

			modal : true,
			height : 700,
			width : 400,
			
			layout : 'fit',
			
			items : [
				{
					xtype : 'initadminpanel'
				}
			], 

			animCollapse : false,
			constrainHeader : true

        });
        
	}
});