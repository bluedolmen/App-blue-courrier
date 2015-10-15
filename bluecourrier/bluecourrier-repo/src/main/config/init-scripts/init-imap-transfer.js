///<import resource="classpath:${config.target.path}/init-scripts/init-common.js">

(function() {

	var InitImapTransfer = Utils.Object.create(Init.InitDefinition, {
		
		id : 'bluecourrier-imap-transfer',
		
		ADMINISTRATORS_GROUP : '${bluecourrier.administrators-group}',
		CONFIG_SITE : '${bluecourrier.config-sitename}',
		INCOMING_FOLDER_PATH : 'app:company_home/st:sites/cm:' + '${bluecourrier.config-sitename}' + '/cm:documentLibrary',
		INCOMING_FOLDER_NAME : 'emailTransfer',

		SOURCE_PATH : "classpath:${config.target.path}/bootstrap/yamma-scripts/imap/*.js",
		TARGET_XPATH : 'app:company_home/app:dictionary/app:scripts/cm:bluecourrier',
		
		SCRIPT_NAME : 'on-create-imap-folder-content.js',

		init : function() {
		
			var imapFolder = this.createImapFolder();
			var scriptRef = this.installScript();
			
			if (!bdInitHelper.hasRules(imapFolder)) {
				this.addRule(imapFolder, scriptRef);
			}
			
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
				success = false,
				imapFolder
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
			
			imapFolder = this.getImapFolder();
			if (null != imapFolder) {
				imapFolder.remove();
			}
			
		},
		
		getTarget : function() {
			
			return (search.selectNodes(this.TARGET_XPATH) || [null])[0];
			
		},
		
		checkInstalled : function() {
			
			var
				imapFolder = this.getImapFolder(),
				ruleScript = this.getRuleScript()
			;
			
			if (null == imapFolder && null == ruleScript) return Init.InstallationStates.NO;
			if (null == imapFolder || null == ruleScript) return Init.InstallationStates.PARTIALLY;
			
			if (!bdInitHelper.hasRules(imapFolder)) return Init.InstallationStates.PARTIALLY;
			
			return Init.InstallationStates.FULL;
			
		},
		
		getDetails : function() {

			var
				imapFolder = this.getImapFolder(),
				ruleScript = this.getRuleScript()
			;
			
			if (null == imapFolder && null == ruleScript) return 'Ni répertoire entrant, ni script';
			if (null == imapFolder) return 'Pas de répertoire entrant';
			if (null == ruleScript) return 'Pas de script';
			if (!bdInitHelper.hasRules(imapFolder)) return 'Pas de règle définie sur le répertoire entrant';
			
			return 'OK';
				
		},
		
		getImapFolder : function() {
			
			var incomingFolderPath = this.INCOMING_FOLDER_PATH + '/cm:' + this.INCOMING_FOLDER_NAME;
			return (search.selectNodes(incomingFolderPath) || [null])[0];
			
		},

		createImapFolder : function() {
			
			var 
				folderName = Utils.Alfresco.getMessage('yamma.folder.emailTransfer.name'),
				incomingFolderPath = this.INCOMING_FOLDER_PATH + '/cm:' + this.INCOMING_FOLDER_NAME,
				folder, name
			;
			
			folder = Utils.Alfresco.createPath(null, incomingFolderPath);
			if (null == folder) {
				throw new Error('IllegalStateException! Unable to create the incoming folder');
			}
			
			name = Utils.asString(folder.properties['cm:name']);
			if (folderName != name) {
				folder.properties['cm:name'] = folderName;
				folder.save();
			}
			
			if (!folder.hasAspect('imap:imapFolder')) {
				folder.addAspect('imap:imapFolder');
			}
			
			return folder;
			
		},
		
		installScript : function() {
			
			var target = this.getTarget();
			if (null == target) {
				target = Utils.Alfresco.createPath(null, this.TARGET_XPATH);
				target.setPermission('Coordinator', this.ADMINISTRATORS_GROUP);
			}
			
			return (bdInitHelper.loadExternalResources(
				this.SOURCE_PATH,
				this.TARGET_XPATH
			) || [null])[0];
			
		},
		
		addRule : function(folder, scriptRef) {
			
			if (null == folder || !folder.exists()) {
				throw new Error('IllegalArgumentException! The provided folder has to be a valid existing node');
			}
			
			var 
				ruleDef
			;
			
			scriptRef = scriptRef || this.getRuleScript();
			if (null == scriptRef) {
				throw new Error('IllegalStateException! Cannot get the rule-script node');
			}
			
			ruleDef = {
				ruleType : ["inbound"],
				title : Utils.Alfresco.getMessage('yamma.folder.emailTransfer.rule.title'),
				description : Utils.Alfresco.getMessage('yamma.folder.emailTransfer.rule.description'),
				applyToChildren : true,
				executeAsynchronously : false,
				disabled : false,
				action : {
					actionDefinitionName : 'composite-action',
					executeAsync : false,
					actions : [
					    {
					    	actionDefinitionName : 'script',
					    	parameterValues : {
					    		'script-ref' : Utils.asString(scriptRef.nodeRef)
					    	},
					    	executeAsync : false
					    }
					]
				},
				owningNode : Utils.asString(folder.nodeRef)
			}
			
			bdInitHelper.addRule(folder, ruleDef);
			
		},
		
		getRuleScript : function() {
			
			return (search.selectNodes(this.TARGET_XPATH + '/cm:' + this.SCRIPT_NAME) || [null])[0];
			
		}
		
	});
	
	init.definition = InitImapTransfer;

})();