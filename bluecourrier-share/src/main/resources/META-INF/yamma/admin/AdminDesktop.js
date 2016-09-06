Ext.define('Yamma.admin.AdminDesktop', {
	
    extend: 'Ext.ux.desktop.App',

    requires: [
        'Ext.window.MessageBox',
        'Ext.ux.desktop.ShortcutModel',
        'Yamma.admin.modules.services.ServicesAdminModule',
        'Yamma.admin.modules.init.InitAdminModule',
        'Yamma.admin.modules.categories.CategoriesAdminModule',
    ],

    init: function() {
    	
        this.callParent();

    },

    getModules : function(){
        return [
        	Ext.create('Yamma.admin.modules.init.InitAdminModule'),
        	Ext.create('Yamma.admin.modules.services.ServicesAdminModule'),
        	Ext.create('Yamma.admin.modules.categories.CategoriesAdminModule')
        ];
    },
    
    taskbarConfig : {
    	startBtnText : i18n.t('admin.adminmodule.button.start'),
    	startBtnScale : 'medium'
    },

    getDesktopConfig: function () {
    	
        var 
        	me = this,
        	ret = me.callParent()
        ;

        return Ext.apply(ret, {

            contextMenuItems: [
                { text: i18n.t('admin.adminmodule.context.onsettings'), handler: me.onSettings, scope: me }
            ],

            shortcuts: Ext.create('Ext.data.Store', {
                model: 'Ext.ux.desktop.ShortcutModel',
                data: [
                	{ 
                		name : i18n.t('admin.adminmodule.shortcuts.init-admin'),
                		iconCls : Yamma.Constants.getIconDefinition('gear-sc').iconCls, 
                		module : 'init-admin' 
                	},
                	{ 
                		name : i18n.t('admin.adminmodule.shortcuts.services-admin'),
                		iconCls : Yamma.Constants.getIconDefinition('services-sc').iconCls, 
                		module : 'services-admin' 
                	},
                	{ 
                		name : i18n.t('admin.adminmodule.shortcuts.categories-admin'),
                		iconCls : Yamma.Constants.getIconDefinition('categories-sc').iconCls, 
                		module : 'categories-admin' 
                	}
                ]
            }),

            wallpaper: '/share/res/yamma/resources/images/desktop.jpg',
            wallpaperStretch: false
            
        });
    },

    getStartConfig : function() {
        var me = this, ret = me.callParent();

        return Ext.apply(ret, {
            title: i18n.t('admin.adminmodule.config.title'),
            iconCls: 'user_suit',
            height: 300,
            toolConfig: {
                width: 100,
                items: [
                    {
                        text : i18n.t('admin.adminmodule.tool.onsettings'),//'Paramètres',
                        iconCls :'icon-tools',
                        handler : me.onSettings,
                        scope : me
                    },
                    '-',
                    {
                        text : i18n.t('admin.adminmodule.tool.onlogout'),
                        iconCls : 'icon-door_out',
                        handler : me.onLogout,
                        scope : me
                    }
                ]
            }
        });
    },

    getTaskbarConfig: function () {
        var ret = this.callParent();

        return Ext.apply(ret, {
//            quickStart: [
//                { name: 'Accordion Window', iconCls: 'accordion', module: 'acc-win' },
//                { name: 'Grid Window', iconCls: 'icon-grid', module: 'grid-win' }
//            ],
            trayItems: [
                { xtype: 'trayclock', flex: 1 }
            ]
        });
    },

    onLogout: function () {
    	
        Ext.Msg.confirm(
        	i18n.t('admin.adminmodule.dialog.exit.title'),
        	i18n.t('admin.adminmodule.dialog.exit.message'),
        	function callback(response) {
        		if ('yes' == response) {
        			window.location.href = 'dologout';
        		}
        	}
        	
        );
        
    },

    onSettings: function () {
//    	Bluedolmen.utils.SlidingPopup.msg({
//    		title : 'You clicked parameters!',
//    		message : 'Super message {0}', 
//			delay : 3000
//    	});
    	
        var dlg = new MyDesktop.Settings({
            desktop: this.desktop
        });
        dlg.show();
    },
    
	launch : function() {
		this.hideLoadingMask();
		return true;
	},
	
	hideLoadingMask : function() {
	    Ext.get('loading-mask').fadeOut({remove:true});			
	    Ext.get('loading').remove();			
	}
    
});