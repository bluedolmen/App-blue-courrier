function initTemplates() {
	
	const 
		TARGET_PATH = "app:company_home/app:dictionary/app:email_templates/cm:yamma"
	; 
	
	getOrCreateTarget();
	loadFileTemplates();
	
	function getOrCreateTarget() {
		
		var targets = search.luceneSearch('+PATH:"' + TARGET_PATH + '"');
		if (targets && targets.length > 0) {
			return targets[0];
		}
		
		return Utils.Alfresco.createPath(null, TARGET_PATH);
		
	}
	
	function loadFileTemplates() {
		
		sideInitHelper.loadExternalFile(
			"classpath:${config.target.path}/bootstrap/yamma-email-templates/*.ftl",
			TARGET_PATH
		);
		
	}
	
}

InitUtils && InitUtils.register(initTemplates);
