(function() {	
	
	
	function titleOrName(node) {
		if (!node) return '';
		return node.properties['cm:title'] || node.name || '';
	};
	
	function titleAndName(node) {
		if (!node) return '';
		
		var 
			name = node.name,
			title = node.properties['cm:title'] || name
		;
		
		return title + '|' + name;
	}
	
	function authorityDisplayAndName(node) {
		if (!node) return '';
		
		var 
			userName = Utils.getPersonUserName(node),
			displayName = Utils.getPersonDisplayName(node)
		; 
		
		return  displayName + '|' + userName; 
	}
	
	function priorityDisplay(node) {
		if (!node) return '';
		var 
			priorityLabel = node.name,
			priorityLevel = node.properties[YammaModel.PRIORITY_LEVEL_PROPNAME]
		;
		
		return priorityLabel + '|' + priorityLevel;
	}
	
	function getClassificationsFieldDefinitions() {
		
		return Utils.map(ClassificationUtils.getMainCategories(),
			function(categoryNode) {
				var categoryName = categoryNode.name;
				
				return {
					name : "Classification!" + categoryName,
					type : 'string',
					evaluate : getActionFunction(categoryNode)
				}; 
			}
		);
		
	}
	
	function getActionFunction(categoryNode_) {
		
		var categoryNode = categoryNode_; // use closure
		
		return function(node) {
			var categories = node.properties['cm:categories'];
			if (!categories) return '';

			var 
				filteredCategories = Utils.filter(categories, function(category) {
					return categoryNode.equals(category.parent); // use Java Object equality
				}),
				displayedValues = Utils.map(filteredCategories, function(category) {
					return titleOrName(category);
				})
			;	
			
			return Utils.asString( 
				Utils.unwrapList(displayedValues) || ''
			);
		};
		
	}
		
	DatasourceDefinitions.register('Statistics',
		{
			
			baseSearchPath : 'app:company_home/st:sites/*/cm:documentLibrary//*',
			baseSearchType : YammaModel.DOCUMENT_TYPE_SHORTNAME,
			
			searchAdditional : {
								
//				sortBy : {
//					column : 'cm:name',
//					dir : 'ASC'
//				}
				
			},			
			
			fields : [
				{
					name : '@typeShort',
					label : 'Type'
				},
				
				{
					
					name : 'Service',
					type : 'composite',
					evaluate : function(document) {
						return YammaUtils.getSiteNode(document);
					},
					fields : [
						{
							name : 'Nom',
							type : 'string',
							evaluate : function(siteNode) {
								return titleOrName(siteNode);
							}
						},
						{
							name : 'Direction',
							type : 'string',
							evaluate : function(siteNode) {
								var direction = ServicesUtils.getParentService(siteNode);
								return titleOrName(direction);
							}
						}
					]
					
				},
				
				{
					name : YammaModel.MAIL_OBJECT_PROPNAME,
					label : 'Objet'
				},
				
				{
					name : YammaModel.INBOUND_DOCUMENT_DELIVERY_DATE_PROPNAME,
					label : "Date d'arrivée"
				},
				
				{
					name : YammaModel.DUEABLE_DUE_DATE_PROPNAME,
					label : 'Date échéance'
				},
				
				{
					name : 'Date traitement',
					type : 'date',
					evaluate : function(node) {
						var processingEvent = Utils.unwrapList(HistoryUtils.getHistoryEvents(node, 'processing'));
						if (!processingEvent) return null;
						
						return processingEvent.properties[YammaModel.EVENT_DATE_PROPNAME];
					}
				},
				
				{
					name : 'Priorité',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.PRIORITIZABLE_PRIORITY_ASSOCNAME, priorityDisplay, true);
					}
				},				
				
				{
					name : 'Délai',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.DUEABLE_DELAY_ASSOCNAME, 'cm:name', true);
					}
				},

				{
					name : 'Visibilité',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.PRIVACY_PRIVACY_LEVEL_ASSOCNAME, 'cm:name', true);
					}
				},
				
				{
					name : 'Distribution',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.ASSIGNABLE_SERVICE_ASSOCNAME, titleAndName, true);
					}
				},
				
				{
					name : 'Assignation',
					type : 'string',
					evaluate : function(node) {
						return this.evaluateAssocProperty(node, YammaModel.ASSIGNABLE_AUTHORITY_ASSOCNAME, authorityDisplayAndName, true);
					}					
				},
				
				{
					name : YammaModel.STATUSABLE_STATE_PROPNAME,
					label : 'État'
				}
				
			].concat(getClassificationsFieldDefinitions())				
			
	
		}
		
	);
	

})();