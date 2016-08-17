Ext.define('Yamma.admin.modules.init.actions.ConfigSite', {
	
	extend : 'Yamma.admin.modules.init.InitAction',
	
	requires : [
	    'Yamma.utils.Constants'
	],
	
	title : i18n.t('admin.modules.init.actions.site.title'), //"Initialisation du site de configuration de BlueCourrier",
	
	statics : {
		CONFIG_SITE_SHORTNAME : Yamma.utils.Constants.CONFIG_SITE_SHORTNAME,
		CONFIG_SITE_TITLE : i18n.t('admin.modules.init.actions.site.config.site-title'),
		CONFIG_SITE_DESCRIPTION : i18n.t('admin.modules.init.actions.site.config.site-description'),
		GET_SITES_URL : 'alfresco://api/sites'
	},
	
    requires: [
    ],

    id : 'init-config-site',
    iconCls : Yamma.utils.Constants.getIconDefinition('gear').iconCls, 

    
    install : function(onNewStateAvailable) {
    	this.createConfigService(onNewStateAvailable);
    },
    
    getState : function(onStateAvailable) {
    	
    	if (!Ext.isFunction(onStateAvailable)) return;
    	
    	var url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(Yamma.admin.modules.init.actions.ConfigSite.GET_SITES_URL);
    	
    	Ext.Ajax.request({
			url: url,
			
			method : 'GET',
			
			params: {
			    nf : Yamma.admin.modules.init.actions.ConfigSite.CONFIG_SITE_SHORTNAME
			},
			
			success: function(response){
				
			    var 
			    	text = response.responseText || '{}',
			    	
			    	jsonResponse = Ext.JSON.decode(text, true /* safe */),
			    	
			    	configSiteAlreadyDefined = Ext.Array.some(jsonResponse, function(site) {
				    	var siteShortName = site.shortName;
				    	return Yamma.admin.modules.init.actions.ConfigSite.CONFIG_SITE_SHORTNAME == siteShortName;
				    })

			    ;
			   
			    onStateAvailable(configSiteAlreadyDefined 
			    	? Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.FULL 
			    	: Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.NO
			    );
			    
			}
		});
    		
    	
    	
    },
    
	createConfigService : function(onNewStateAvailable) {
		
		var 
			values = {
				shortName : Yamma.admin.modules.init.actions.ConfigSite.CONFIG_SITE_SHORTNAME,
				title : Yamma.admin.modules.init.actions.ConfigSite.CONFIG_SITE_TITLE,
				description : Yamma.admin.modules.init.actions.ConfigSite.CONFIG_SITE_DESCRIPTION,
				sitePreset : 'site-dashboard',
				visibility : 'PUBLIC'
			}
		;

		Ext.Ajax.request({
		    headers: {
		        'Content-Type': 'application/json'
		    },
		    url: '/share/service/modules/create-site',
		    method : 'POST',
		    jsonData : Ext.JSON.encode(values),
		    
		    success: function(response, options) {
		    	
		    	setNewState(Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.FULL);
		    	
		    },
		    
		    failure: function(response, options) {
		    	Bluedolmen.Alfresco.genericFailureManager(response);
		    	setNewState(Yamma.admin.modules.init.InitAction.INSTALLATION_STATES.UNDETERMINED);
		    }
		});							
		
		function setNewState(state) {
			if (!Ext.isFunction(onNewStateAvailable)) return;
			onNewStateAvailable(state);
		}
		
	}
    
    
});