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
    	startBtnText : 'Menu',
    	startBtnScale : 'medium'
    },

    getDesktopConfig: function () {
    	
        var 
        	me = this,
        	ret = me.callParent()
        ;

        return Ext.apply(ret, {

            contextMenuItems: [
                { text: 'Changer les paramètres', handler: me.onSettings, scope: me }
            ],

            shortcuts: Ext.create('Ext.data.Store', {
                model: 'Ext.ux.desktop.ShortcutModel',
                data: [
                	{ 
                		name : 'Initialisation', 
                		iconCls : Yamma.Constants.getIconDefinition('gear-sc').iconCls, 
                		module : 'init-admin' 
                	},
                	{ 
                		name : 'Services', 
                		iconCls : Yamma.Constants.getIconDefinition('services-sc').iconCls, 
                		module : 'services-admin' 
                	},
                	{ 
                		name : 'Catégories', 
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
            title: 'BlueCourrier',
            iconCls: 'user_suit',
            height: 300,
            toolConfig: {
                width: 100,
                items: [
                    {
                        text : 'Paramètres',
                        iconCls :'icon-tools',
                        handler : me.onSettings,
                        scope : me
                    },
                    '-',
                    {
                        text : 'Déconnecter',
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
        	'Quitter ?', 
        	'Etes-vous certain de vouloir quitter ?',
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