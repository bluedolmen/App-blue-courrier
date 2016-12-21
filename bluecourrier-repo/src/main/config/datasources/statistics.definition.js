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
	
	function listBCTasks(node, filter) {
		
		if (null == node) return [];
		var filter_ = filter || function(task) {
			var taskName = Utils.asString(task.name);
			return Utils.String.startsWith(taskName, "bcinwf");
		};
		
		var tasks_ = [];
		
		Utils.forEach(node.activeWorkflows || [], function(workflowInstance) {
			
			var tasks = BPMUtils.getTasksForWorkflow(workflowInstance) || [];
			
			tasks = BPMUtils.filterTasks(tasks, filter_);
			
			tasks_ = tasks_.concat(tasks);
			
		});
		
		return tasks_;
		
	}
	
    function getPooledActors(task) {

        var
            pooledActors = Utils.toArray(task.properties['bpm:pooledActors'])
        ;

        return Utils.Array.map(pooledActors, function(pooledActor) {
        	
            pooledActor = search.findNode(pooledActor);
            
            var pooledActor = Utils.asString(pooledActor.properties['cm:authorityName']);
            if (pooledActor) return pooledActor;
            
            pooledActor = Utils.asString(pooledActor.properties['cm:userName']);
            var actorEmail = pooledActor ? Utils.Alfresco.getPersonEmail(pooledActor) : '';
            
            return pooledActor + '|' + actorEmail;
            
        });

    }	
	
    function getTaskDescription(task) {

        var 
            taskId = task.id,
            taskName = task.name,
            taskOwner = Utils.asString(task.properties['cm:owner']),
            ownerEmail = taskOwner ? Utils.Alfresco.getPersonEmail(taskOwner) : '',
            pooledActors = getPooledActors(task),
            properties = Utils.Alfresco.BPM.getNonAlfrescoProperties(task),
            status = Utils.asString(task.properties['bpm:status']),
            description = {
                id : taskId,
                name : taskName,
                status : status,
                properties : properties,
                owner : taskOwner + '|' + ownerEmail,
                pooledActors : pooledActors
            }
        ;

        return description;

    }	
	

	function getEventDescription(event) {
	
		var 
			eventDate = event.properties['cm:created'],
			eventType = Utils.asString(event.properties[YammaModel.EVENT_EVENT_TYPE_PROPNAME]),
			eventName = Utils.asString(event.properties[YammaModel.EVENT_DESCRIPTION_PROPNAME]),
			eventReferrer = Utils.asString(event.properties[YammaModel.EVENT_REFERRER_PROPNAME]),
//			eventDelegate = Utils.Alfresco.getPersonDisplayName(Utils.asString(event.properties[YammaModel.EVENT_DELEGATE_PROPNAME]) || 'unknown'),
			description = {
				date : eventDate,
				type : eventType,
				name : eventName,
				referrer : (eventReferrer || 'unkown') + (eventReferrer ? '|' + Utils.Alfresco.getPersonDisplayName(eventReferrer) : '') + (eventReferrer ? '|' + Utils.Alfresco.getPersonEmail(eventReferrer) : '')
//				delegate : eventDelegate
			}
		;
	
		return description;
	
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
					name : 'tasks',
					label : 'Tâches',
					evaluate : function(node) {

						var tasks = listBCTasks(node, ['bcinwf:validatingTask', 'bcinwf:processingTask','bcogwf:processingTask','bcogwf:validatingTask','bcogwf:certifyingTask','bcogwf:sendingTask']);

						return Utils.Array.map(tasks, function(task) {
							
							return getTaskDescription(task);
							
						});
						
					}
				},

				{
					name : 'history',
					label : 'Historique',
					evaluate : function(node) {

						var events = HistoryUtils.getHistoryEvents(node);

						return Utils.Array.map(events, function(event) {
							return getEventDescription(event);
						});
						
					}
				},
				
//				{
//					name : 'instructor',
//					label : 'Instructeur',
//					evaluate : function(node) {
//						
//						var processingEvents = HistoryUtils.getHistoryEvents(node, 'startProcessing');
//						if (Utils.isArrayEmpty(processingEvents)) return '';
//						
//						return processingEvents[0].properties[YammaModel.EVENT_REFERRER_PROPNAME];
//						
//					}
//				},
				
//				{
//					name : 'instructor',
//					label : 'Instructeur',
//					evaluate : function(node) {
//						
//						var instructorName = Utils.asString(node.properties['bcinwf:instructorUserName']);
//						if (!instructorName) return '';
//						
//						return Utils.Alfresco.getPersonDisplayName(instructorName, false /* displayUserName */) + '|' + instructorName;
//						
//					}
//				},
//				
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
						var processingEvents = HistoryUtils.getHistoryEvents(node, 'startProcessing');
						// may have several history events (task re-assignment)
						if (Utils.isArrayEmpty(processingEvents)) return '';
						
						return processingEvents[0].properties[YammaModel.EVENT_DATE_PROPNAME];
					}
				},
				
				{
					name : 'closeProcessingDate',
					label : 'Date fin traitement',
					type : 'date',
					evaluate : function(node) {
						var processingEvents = HistoryUtils.getHistoryEvents(node, 'close');
						if (Utils.isArrayEmpty(processingEvents)) return '';
						
						return processingEvents[0].properties[YammaModel.EVENT_DATE_PROPNAME];
					}
				},
				
//				{
//					name : YammaModel.PRIORITY_TYPE_SHORTNAME + '_name',
//					label : 'Priorité',
//					type : 'string',
//					evaluate : function(node) {
//						return this.evaluateAssocProperty(node, YammaModel.PRIORITIZABLE_PRIORITY_ASSOCNAME, priorityDisplay, true);
//					}
//				},				
//				
//				{
//					name : YammaModel.DELAY_TYPE_SHORTNAME + '_name',
//					label : 'Délai',
//					type : 'string',
//					evaluate : function(node) {
//						return this.evaluateAssocProperty(node, YammaModel.DUEABLE_DELAY_ASSOCNAME, 'cm:name', true);
//					}
//				},
//
//				{
//					name : YammaModel.PRIVACY_LEVEL_TYPE_SHORTNAME + '_name',
//					label : 'Confidentialité',
//					type : 'string',
//					evaluate : function(node) {
//						return this.evaluateAssocProperty(node, YammaModel.PRIVACY_PRIVACY_LEVEL_ASSOCNAME, 'cm:name', true);
//					}
//				},
				
				{
					name : YammaModel.STATUSABLE_STATE_PROPNAME,
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