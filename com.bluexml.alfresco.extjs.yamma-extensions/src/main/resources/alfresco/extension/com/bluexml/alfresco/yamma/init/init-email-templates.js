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
		
		sideInitHelper.loadExternalResources(
			"classpath:${config.target.path}/bootstrap/yamma-email-templates/*.ftl",
			TARGET_PATH
		);
		
	}
	
}

Init.Utils.register(initTemplates);

(function() {

	var EmailTemplates = Utils.Object.create(Init.InitDefinition, {
	
		SOURCE_XPATH : "classpath:${config.target.path}/bootstrap/yamma-email-templates/*.ftl",
		TARGET_PATH : "app:company_home/app:dictionary/app:email_templates/cm:yamma",
		
		id : 'email-templates',
		
		init : function() {
			this.getOrCreateTarget();
			
			sideInitHelper.loadExternalResources(
				this.SOURCE_XPATH,
				this.TARGET_PATH
			);
		},
		
		reset : function() {
			var target = this.getTarget();
			if (!target) return;
			
			var 
				resourcesStates = sideInitHelper.checkExternalResources(
					this.SOURCE_XPATH,
					this.TARGET_PATH
				),
				state = null,
				node = null
			;
			
			// Remove modified resources
			for (var nodeRef in resourcesStates) {
				state = Utils.asString(resourcesStates[nodeRef]);
				if ('MODIFIED' == state) {
					node = search.findNode(nodeRef);
					if (null == node) {
						logger.warn("Cannot find the node with nodeRef='" + nodeRef + "' to be deleted while performing reset");
						continue;
					}
						
					var success = node.remove();
					if (!success) {
						logger.warn("Cannot delete the node '" + node.nodeRef + "' while performing reset");
					}
				}
			}
			
			// Then execute the installation again
			this.init();
		},
		
		checkInstalled : function() {
			var target = this.getTarget();
			if (!target) return Init.InstallationStates.NO;
			
			var 
				resourcesStates = sideInitHelper.checkExternalResources(
					this.SOURCE_XPATH,
					this.TARGET_PATH
				),
				state = null
			;
			
			for (key in resourcesStates) {
				state = resourcesStates[key];
				if ('UNKNOWN' == Utils.asString(state)) return Init.InstallationStates.UNKNOWN;
			}
			
			for (key in resourcesStates) {
				state = resourcesStates[key];
				if ('MISSING' == Utils.asString(state)) return Init.InstallationStates.PARTIALLY;
			}
			
			for (key in resourcesStates) {
				state = resourcesStates[key];
				if ('MODIFIED' == Utils.asString(state)) return Init.InstallationStates.MODIFIED;
			}
			
			return Init.InstallationStates.FULL;
		},
		
		getDetails : function() {
			
			var 
				output = "",
				target = this.getTarget()
			;
			if (!target) return output;
			
			var 
				resourcesStates = sideInitHelper.checkExternalResources(
					this.SOURCE_XPATH,
					this.TARGET_PATH
				),
				node = null,
				label = ""
			;
			
			for (var nodeRef in resourcesStates) {
				state = resourcesStates[nodeRef];
				node = search.findNode(nodeRef);
				label = node ? node.name + ' (' + nodeRef + ')' : nodeRef;
				
				output += ( '[' + Utils.asString(state) + '] ' + label + '\n');
			}
			
			return output;
		},
		
		getTarget : function() {
			var targets = search.luceneSearch('+PATH:"' + this.TARGET_PATH + '"') || [];
			return targets[0];
		},
		
		getOrCreateTarget : function() {
	
			var target = this.getTarget();
			if (target) return target;
			
			return Utils.Alfresco.createPath(null, TARGET_PATH);
			
		}	
		
	});
	
	sideInitHelper.registerInitDefinition(EmailTemplates);

})();