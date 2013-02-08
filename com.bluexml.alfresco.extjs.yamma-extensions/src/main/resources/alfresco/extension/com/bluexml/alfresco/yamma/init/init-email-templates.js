(function() {

	var EmailTemplates = Utils.Object.create(Init.InitDefinition, {
	
		SOURCE_PATH : "classpath:${config.target.path}/bootstrap/yamma-email-templates/*.ftl",
		TARGET_XPATH : "app:company_home/app:dictionary/app:email_templates/cm:yamma",
		
		id : 'email-templates',
		
		init : function() {
			this.getOrCreateTarget();
			
			sideInitHelper.loadExternalResources(
				this.SOURCE_PATH,
				this.TARGET_XPATH
			);
		},
		
		clear : function() {
			var target = this.getTarget();
			if (!target) return;
			
			var 
				resourcesStates = sideInitHelper.checkExternalResources(
					this.SOURCE_PATH,
					this.TARGET_XPATH
				),
				state = null,
				node = null,
				success = false
			;
			
			// Remove resources
			for (var nodeRef in resourcesStates) {
				state = Utils.asString(resourcesStates[nodeRef]);
				if ('MISSING' != state) continue;
					
				node = search.findNode(nodeRef);
				if (null == node) {
					logger.warn("Cannot find the node with nodeRef='" + nodeRef + "' to be deleted while performing reset");
					continue;
				}
					
				success = node.remove();
				if (!success) {
					logger.warn("Cannot delete the node with nodeRef='" + node.nodeRef + "' while performing reset");
				}
			}
			
			if (target.children.length == 0) {
				target.remove();
			} else {
				logger.warn("The container was not empty; it was not removed. You should perform this operation manually if necessary")
			}
			
		},
		
		checkInstalled : function() {
			var target = this.getTarget();
			if (!target) return Init.InstallationStates.NO;
			
			var 
				resourcesStates = sideInitHelper.checkExternalResources(
					this.SOURCE_PATH,
					this.TARGET_XPATH
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
					this.SOURCE_PATH,
					this.TARGET_XPATH
				),
				state = null,
				node = null,
				label = ""
			;
			
			for (var nodeRef in resourcesStates) {
				state = Utils.asString(resourcesStates[nodeRef]);
				label = nodeRef;
				
				if ('MISSING' != state) {
					// If missing, the nodeRef is not a nodeRef, it is a reference on the filesystem
					node = search.findNode(nodeRef);
					label = node.name + ' (' + nodeRef + ')';
				}
				
				output += ( '[' + state + '] ' + label + '\n');
			}
			
			return output;
		},
		
		getTarget : function() {
			var targets = search.luceneSearch('+PATH:"' + this.TARGET_XPATH + '"') || [];
			return targets[0];
		},
		
		getOrCreateTarget : function() {
	
			var target = this.getTarget();
			if (target) return target;
			
			return Utils.Alfresco.createPath(null, this.TARGET_XPATH);
			
		}	
		
	});
	
	sideInitHelper.registerInitDefinition(EmailTemplates);

})();