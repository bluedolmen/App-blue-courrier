///<import resource="classpath:${config.target.path}/init-scripts/init-common.js">
(function() {
	
	// TODO: Externalize this parameters
	var 
		ROOT_CATEGORY_NAME = 'BlueCourrier',
		CLASSIFIABLE_ASPECT = 'cm:generalclassifiable',
		ADMINISTRATION_PERMISSION = 'Coordinator',
		ADMINISTRATION_GROUP = 'GROUP_${bluecourrier.administrators-group}' 
	;

	var BlueCourrierCategories = Utils.Object.create(Init.InitDefinition, {
		
		id : 'bluecourrier-categories',
		
		init : function() {

			var
				rootCategory = this.getRootCategory();
			;
			
			if (null == rootCategory) {
				rootCategory = this.createRootCategory();
			}
			
			this.setAdministrationPermission(rootCategory);
			
		},
		
		clear : function() {
			
			var rootCategory = this.getRootCategory();
			
			rootCategory.remove();
			
		},
		
		checkInstalled : function() {
			
			var rootCategory = this.getRootCategory();
			if (null == rootCategory) return Init.InstallationStates.NO;
			
			if (this.hasAdministrationPermission(rootCategory)) return Init.InstallationStates.FULL;
			
			return Init.InstallationStates.PARTIALLY;
			
		},
		
		getDetails : function() {

			var 
				rootCategory = this.getRootCategory(),
				details = ''
			;
			if (null == rootCategory) {
				details = "La catégorie racine n'existe pas.";
			}
			else if (!this.hasAdministrationPermission(rootCategory)) {
				details = "Les permissions d'administration ne sont pas fixées sur la catégorie racine.";
			}
			else {
				details = "Catégorie racine existante avec les droits d'administration."
			}

			return details;
			
		},
		
		getRootCategory : function() {
			
			return companyhome.childrenByXPath('/cm:categoryRoot/' + CLASSIFIABLE_ASPECT + '/cm:' + ROOT_CATEGORY_NAME)[0] || null;
			
		},
		
		createRootCategory : function() {
			
			return classification.createRootCategory(CLASSIFIABLE_ASPECT, ROOT_CATEGORY_NAME);
			
		},
		
		hasAdministrationPermission : function(node) {
			
			if (null == node) return false;
			
			var permissions = node.getPermissions();
			
			return Utils.exists(permissions, function(permission) {
				
				var 
					split = permission.split(';'),
					kind = split[0],
					authority = split[1],
					role = split[2]
				;
				
				return (
					'ALLOWED' == kind && 
					ADMINISTRATION_GROUP == authority && 
					ADMINISTRATION_PERMISSION == role
				);
				
			});
			
		},
		
		setAdministrationPermission : function(node) {
			
			if (null == node) return;
			
			node.setPermission(ADMINISTRATION_PERMISSION, ADMINISTRATION_GROUP);
			
		}
		
	});
	
	init.definition = BlueCourrierCategories;
	
})();