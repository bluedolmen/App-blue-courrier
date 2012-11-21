var YammaUtils = {
	
	CONFIG_SITE : {
		preset : 'site-YaMma-EE',
		name : 'config',
		title : 'Configuration',
		description : "Site dédié à la configuration de l'application",
		visibility : siteService.PUBLIC_SITE
	},
		
	getSiteNode : function(document) {
		if (null == document || undefined === document.getSiteShortName) return null;
		var 
			siteShortName = document.getSiteShortName(),
			site = siteService.getSite(siteShortName)
		;
		
		if (null == site) return null; // non-existing or non-accessible
		return site.getNode();		
	},
	
	getOrCreateConfigSite : function() {
		
		var 
			me = this,
			configSite = siteService.getSite(this.CONFIG_SITE.name);
		
		if (null != configSite) { return configSite.getNode(); }
		
		function createConfigSite () {
			
			return siteService.createSite(
				me.CONFIG_SITE.preset, /* sitePreset */
				me.CONFIG_SITE.name, /* shortName */
				me.CONFIG_SITE.title, /* title */
				me.CONFIG_SITE.description, /* description */
				me.CONFIG_SITE.visibility /* visibility */				
			);
			
		};

		return createConfigSite();

	},
	
	isConfigSite : function(site) {
		
		if (null == site) return false;
		
		var siteName = site;
		
		if (site.typeShort && 'st:site' == site.typeShort) {
			siteName = site.name;			
		}
		
		if (!siteName) return false;
		return (this.CONFIG_SITE.name === Utils.asString(siteName));
	}	
	
	
};
