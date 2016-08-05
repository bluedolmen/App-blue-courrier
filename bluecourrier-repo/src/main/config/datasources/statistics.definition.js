(function() {	
		
	function priorityDisplay(node) {
		if (null == node) return '';
		var 
			priorityLabel = node.name,
			priorityLevel = node.properties[YammaModel.PRIORITY_LEVEL_PROPNAME]
		;
		
		return priorityLabel + '|' + priorityLevel;
	}
	
	function evaluateCategories(node) {
		
		var
			result = {},
			categories = ClassificationUtils.getNodeCategories(node)
		;
		if (!categories) return result;
		
		Utils.forEach(categories, function(categoryNode) {
			
			var title = Utils.Alfresco.getTitleOrName(categoryNode);
			if (!title) return; // continue
			
			var ancestors = ClassificationUtils.getCategoryAncestors(categoryNode) || [];
			result[title] = Utils.map(ancestors, function(ancestorNode) { return Utils.Alfresco.getTitleOrName(ancestorNode); });
			
		});
		
		return result;
		
	}
	
	DatasourceDefinitions.register('Statistics',
		{

//			baseSearchPath : 'app:company_home/st:sites/*/cm:documentLibrary//*',
//			baseSearchType : YammaModel.DOCUMENT_ASPECT_SHORTNAME,
			
			searchAdditional : {
				
				listnodes : function(params) {
					
					return yammaStats.getDocumentNodes(/* no limit */);
					
				}
				
			},
			
			fields : [
			          
				'@nodeRef',
				'cm:created',
				
				{
					name : 'type',
					label : 'Type',
					evaluate : function(document) {
						
						if (null == document) return '';
						if (document.hasAspect(YammaModel.INBOUND_DOCUMENT_ASPECT_SHORTNAME)) return 'incoming';
						if (document.hasAspect(YammaModel.OUTBOUND_DOCUMENT_ASPECT_SHORTNAME)) return 'outgoing';
						
						logger.warn('[datasource.statistics] Cannot determine type for node ' + document.nodeRef);
						return '';
						
					}
				},
				
//				{
//					
//					name : 'service',
//					label : 'Service',
//					type : 'object',
//					evaluate : function(document) {
//						var 
//							enclosingSiteNode = Utils.Alfresco.getEnclosingSiteNode(document),
//							parentNode = null
//						;
//						if (null == enclosingSiteNode) return {};
//						
//						parentNode = ServicesUtils.getParentServiceNode(enclosingSiteNode);
//						
//						return {
//							name : Utils.Alfresco.getTitleAndName(enclosingSiteNode),
//							parent : Utils.Alfresco.getTitleAndName(parentNode)
//						};
//					}
//					
//				},
				
				{
					
					name : 'service',
					label : 'Service',
					evaluate : function(document) {
						var 
							enclosingSiteNode = Utils.Alfresco.getEnclosingSiteNode(document)
						;
						
						return (null == enclosingSiteNode) ? '' : Utils.Alfresco.getTitleAndName(enclosingSiteNode);
						
					}
					
				},
				
				{
					name : 'instructor',
					label : 'Instructeur',
					evaluate : function(node) {
						
						var instructorName = Utils.asString(node.properties['bcinwf:instructorUserName']);
						if (!instructorName) return '';
						
						return Utils.Alfresco.getPersonDisplayName(instructorName, false /* displayUserName */) + '|' + instructorName;
						
					}
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
					name : 'startProcessingDate',
					label : 'Date début traitement',
					type : 'date',
					evaluate : function(node) {
						
						// test residual property
						var startProcessingDate = node.properties['bcinwf:startProcessingDate'];
						if (null != startProcessingDate) {
							return startProcessingDate;
						}
						
						var processingEvents = HistoryUtils.getHistoryEvents(node, 'acceptProcessing');
						// may have several history events (task re-assignment)
						if (Utils.isArrayEmpty(processingEvents)) return '';
						
						return processingEvents[0].properties['cm:created'];
						
					}
				},
				
				{
					name : 'closeProcessingDate',
					label : 'Date fin traitement',
					type : 'date',
					evaluate : function(node) {

						// test residual property
						var endProcessingDate = node.properties['bcinwf:endProcessingDate'];
						if (null != endProcessingDate) {
							return endProcessingDate;
						}
						
						var processingEvents = HistoryUtils.getHistoryEvents(node, 'close');
						if (Utils.isArrayEmpty(processingEvents)) return '';
						
						return processingEvents[0].properties['cm:created'];
					}
				},
				{
					name : YammaModel.STATUSABLE_STATUS_PROPNAME,
					label : 'État'
				},
				
				{
					name : 'categories',
					label : 'Catégories',
					evaluate : evaluateCategories
				},
				
				{
					name : 'attachmentsNumber',
					label : 'Nombre de fichiers attachés',
					evaluate : function(node) {
						return AttachmentUtils.getAttachments(node).length;
					}
				},
				{
					name : 'processKind',
					label : 'Type de processus',
					evaluate : function(node) {
						return node.properties["bluecourrier:processKind"];
					}
				}
			]				
			
	
		}
		
	);
	

})();