Ext.define('Yamma.admin.modules.categories.CategoriesAdminModule', {
	
    extend: 'Ext.ux.desktop.Module',

    requires: [
    	'Yamma.admin.modules.categories.CategoriesAdminPanel'
    ],

    id : 'categories-admin',
    iconCls : Yamma.utils.Constants.getIconDefinition('tag_orange').iconCls, 
    
    
    init : function(){
        this.launcher = {
            text: "Gestion des catégories",
            iconCls : this.iconCls
        };
    },

    createWindow : function(){
    	
		var 
			me = this,
			desktop = this.app.getDesktop(),
			win = desktop.getWindow('categories-admin-win')
		;
		
		if (win) return win;
		
        return desktop.createWindow({
        	
        	id : 'categories-admin-win',
			title : 'Gestion des catégories',
			iconCls : me.iconCls,

			modal : true,
			height : 700,
			width : 400,
			
			layout : 'fit',
			
			items : [
				{
					xtype : 'categoriesadminpanel'
				}
			], 

			animCollapse : false,
			constrainHeader : true

        });
        
	}
});