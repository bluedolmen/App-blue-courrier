///<import resource="classpath:${config.target.path}/init-scripts/init-common.js">

(function() {

	var EmailTemplates = Utils.Object.create(Init.InitDefinition, {
	
		SOURCE_PATH : "classpath:${config.target.path}/bootstrap/yamma-email-templates/*.ftl",
		TARGET_XPATH : 'app:company_home/' + SendMailUtils.getMailTemplatesPath(),
		TARGET_NAME : 'BlueCourrier',
		TARGET_TITLE : "Modèles de mél pour l'application BlueCourrier",
		
		ADMINS_GROUP : '${bluecourrier.administrators-group}',
		
		id : 'email-templates',
		
		init : function() {
			
			var 
				me = this,
				target = this.getOrCreateTarget()
			;
			
			this.setTargetPermission(target);
			
			bdInitHelper.loadExternalResources(
				this.SOURCE_PATH,
				this.TARGET_XPATH
			);
			
			function updateTargetMetadata() {
				
				var name = Utils.asString(target.properties['cm:name']);
				if (me.TARGET_NAME != name) {
					target.properties['cm:name'] = me.TARGET_NAME;
				}
				
				var title = Utils.asString(target.properties['cm:title']);
				if (me.TARGET_TITLE != title) {
					target.properties['cm:title'] = me.TARGET_TITLE;
				}
				
				target.save();
				
			}
			
		},
		
		getOrCreateTarget : function() {
	
			var 
				target = this.getTarget(),
				adminsGroup
			;
			if (null != target) return target;
						
			target = Utils.Alfresco.createPath(null, this.TARGET_XPATH);
			
			
			return target;
			
		},	
		
		getTarget : function() {
			
			var targets = search.selectNodes(this.TARGET_XPATH) || []; 
			return targets[0];
			
		},
		
		setTargetPermission : function(target) {
			
			var adminsGroup = groups.getGroup(this.ADMINS_GROUP);
			target = target || this.getTarget();
			
			if (null == target || null == adminsGroup) return;
			
			target.setPermission('Coordinator', adminsGroup.fullName);
			
		},
		
		checkTargetPermission : function(target) {
			
			var me = this;
			
			target = target || this.getTarget();
			if (null == target) return false;
			
			return Utils.Array.exists(target.getPermissions(), function(permdef) {
				return Utils.asString(permdef) == 'ALLOWED;GROUP_' + me.ADMINS_GROUP + ';Coordinator'; 
			});
			
		},
		
		clear : function() {
			
			var target = this.getTarget();
			if (!target) return;
			
			var 
				resourcesStates = bdInitHelper.checkExternalResources(
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
				if ('IDENTICAL' != state) continue;
					
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
				logger.warn("The container was not empty; it was not removed. You should perform this operation manually if necessary");
			}
			
		},
		
		checkInstalled : function() {
			
			var target = this.getTarget();
			if (!target) return Init.InstallationStates.NO;
			
			if (!this.checkTargetPermission(target)) return Init.InstallationStates.PARTIALLY;
			
			var 
				resourcesStates = bdInitHelper.checkExternalResources(
					this.SOURCE_PATH,
					this.TARGET_XPATH
				),
				state = null,
				key = null
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
			if (!target) return "Aucun élément";
			
			if (!this.checkTargetPermission(target)) {
				output += "Les droits ne sont pas posés correctement sur le répertoire de templates d'emails.\n";
			}
			
			var 
				resourcesStates = bdInitHelper.checkExternalResources(
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
		}
		
		
	});
	
	init.definition = EmailTemplates;
	
})();