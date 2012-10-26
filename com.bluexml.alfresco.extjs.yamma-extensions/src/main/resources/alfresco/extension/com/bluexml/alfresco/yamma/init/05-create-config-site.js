function createConfigSite() {
	
	var configSite = YammaUtils.getOrCreateConfigSite();
	if (!configSite) {
		logger.error('Cannot create the configuration site!');
	}

};
	
InitUtils && InitUtils.register(createConfigSite, 5);
