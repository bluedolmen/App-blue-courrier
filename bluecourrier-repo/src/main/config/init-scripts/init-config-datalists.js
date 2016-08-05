///<import resource="classpath:${config.target.path}/init-scripts/init-common.js">

(function() {

	var ConfigSiteDatalists = Utils.Object.create(Init.InitDefinition, {
		
		id : 'config-site-datalists',		
		
		DATALISTS : {
			
			'privacy-levels' : {
				
				title : 'Niveau de confidentialité',
				typeShort : YammaModel.PRIVACY_LEVEL_TYPE_SHORTNAME,
				items : (function() {
					
					var privacyPublic = {};
					privacyPublic['name'] = 'PUBLIC';
					privacyPublic[YammaModel.PRIVACY_LEVEL_RESTRICTED_PROPNAME] = false;
					privacyPublic[YammaModel.PRIVACY_LEVEL_DISCARD_EXISTING_PROPNAME] = false;
					
					var privacyRestricted = {};
					privacyRestricted['name'] = 'PRIVE';
					privacyRestricted[YammaModel.PRIVACY_LEVEL_RESTRICTED_PROPNAME] = true;
					privacyRestricted[YammaModel.PRIVACY_LEVEL_DISCARD_EXISTING_PROPNAME] = false;
					privacyRestricted[YammaModel.PRIVACY_LEVEL_ASSISTANT_ROLE_PROPNAME] = 'SiteCollaborator';
					privacyRestricted[YammaModel.PRIVACY_LEVEL_MANAGER_ROLE_PROPNAME] = 'SiteCollaborator';
					privacyRestricted[YammaModel.PRIVACY_LEVEL_SUPERVISOR_ROLE_PROPNAME] = 'SiteCollaborator';
					privacyRestricted[YammaModel.PRIVACY_LEVEL_INSTRUCTOR_ROLE_PROPNAME] = 'No';
					
					return [
						privacyPublic,
						privacyRestricted
					];
					
				})()
				
			},
			
			'priority-levels' : {
				
				title : 'Priorité',
				typeShort : YammaModel.PRIORITY_TYPE_SHORTNAME,
				items : (function() {
					
					// TODO: (bpajot) That shouldn't be here and externalized in an appropriate (properties) file
					var priorityNormal = {};
					priorityNormal['name'] = 'NORMAL';
					priorityNormal[YammaModel.PRIORITY_LEVEL_PROPNAME] = 20;
					
					var priorityImportant = {};
					priorityImportant['name'] = 'IMPORTANT';
					priorityImportant[YammaModel.PRIORITY_LEVEL_PROPNAME] = 50;
					
					var priorityVeryImportant = {};
					priorityVeryImportant['name'] = 'TRES IMPORTANT';
					priorityVeryImportant[YammaModel.PRIORITY_LEVEL_PROPNAME] = 70;
					
					var priorityClaim = {};
					priorityClaim['name'] = 'RECLAMATION';
					priorityClaim[YammaModel.PRIORITY_LEVEL_PROPNAME] = 90;
					
					return [
					    priorityNormal,
					    priorityImportant,
					    priorityVeryImportant,
					    priorityClaim
					];
					
				})()
			},
			
			'delays' : {
				
				title : 'Délais',
				typeShort : YammaModel.DELAY_TYPE_SHORTNAME
				
			},
			
			'delivery-models' : {
				
				title : 'Circuits modèles',
				typeShort : YammaModel.DELIVERY_MODEL_TYPE_SHORTNAME
				
			},
			
			'organizations' : {
				
				title : 'Organisations',
				typeShort : DirectoryModel.ORGANIZATION_ENTRY_TYPE_SHORTNAME,
				permissions : (function() {
					var permissions = {};
					permissions['GROUP_' + ServicesUtils.SERVICE_ASSISTANT_ROLENAME] = 'SiteCollaborator';
					permissions['GROUP_' + ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME] = 'SiteCollaborator';
					permissions['GROUP_' + ServicesUtils.SERVICE_MANAGER_ROLENAME] = 'SiteCollaborator';
					return permissions;
				})()
				
			},
			
			'persons' : {
				
				title : 'Contacts',
				typeShort : DirectoryModel.PERSON_ENTRY_TYPE_SHORTNAME,
				permissions : (function() {
					var permissions = {};
					permissions['GROUP_' + ServicesUtils.SERVICE_ASSISTANT_ROLENAME] = 'SiteCollaborator';
					permissions['GROUP_' + ServicesUtils.SERVICE_INSTRUCTOR_ROLENAME] = 'SiteCollaborator';
					permissions['GROUP_' + ServicesUtils.SERVICE_MANAGER_ROLENAME] = 'SiteCollaborator';
					return permissions;
				})()
				
			}
			
		},
	
		init : function() {
		
			this.createDatalistContainers();
			
		},
		
		clear : function() {
			
			var 
				dlId, dlDefinition
			;
	
			for (dlId in this.DATALISTS) {
				
				dlDefinition = this.DATALISTS[dlId];
				YammaUtils.removeDataListByType(dlDefinition.typeShort);
				
			}
			
		},
		
		checkInstalled : function() {
			
			var
				installedNb = 0,
				totalNb = 0,
				dlId, dlDefinition
			;
			
			for (dlId in this.DATALISTS) {
				
				dlDefinition = this.DATALISTS[dlId];
				if (null != YammaUtils.getDataListByType(dlDefinition.typeShort)) {
					installedNb += 1;
				}
				
				totalNb += 1;
				
			}
			
			if (0 == installedNb) return Init.InstallationStates.NO;
			if (installedNb == totalNb) return Init.InstallationStates.FULL;
			
			return Init.InstallationStates.PARTIALLY;
			
		},
		
		getDetails : function() {

			var
				installed = [],
				missing = [],
				dlId, dlDefinition
			;
	
			for (dlId in this.DATALISTS) {
				
				dlDefinition = this.DATALISTS[dlId];
				if (null == YammaUtils.getDataListByType(dlDefinition.typeShort)) {
					missing.push(dlId);
				}
				else {
					installed.push(dlId);
				}
				
			}
			
			return (
				( installed.length > 0 ? 'Installed: ' + Utils.String.join(installed, ', ') : '' )
				+ '\n'
				+ ( missing.length > 0 ? 'Missing: ' + Utils.String.join(missing, ', ') : '' )
			);
			
		},
		
		
		createDatalistContainers : function() {
			
			var 
				me = this,
				dl, dlId, dlDefinition
			;

			for (dlId in this.DATALISTS) {
				
				dlDefinition = this.DATALISTS[dlId];
				dl = YammaUtils.getDataListByType(dlDefinition.typeShort);
				if (null != dl) continue;
				
				dlDefinition.name = dlDefinition.name || dlId;
				YammaUtils.createDataList(dlDefinition);
				
			}
			
		}
		
		
	});
	
	init.definition = ConfigSiteDatalists;

})();