function createConfigSite() {
	
	var configSite = YammaUtils.getOrCreateConfigSite();
	if (!configSite) {
		logger.error('Cannot create the configuration site!');
	}

};
	
Init.Utils.register(createConfigSite, 5);
