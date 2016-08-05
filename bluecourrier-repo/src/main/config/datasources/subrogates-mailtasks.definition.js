(function() {
	
	var _fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
	
	function isParaphe(node) {
		
		if (null == node) return false;
		return node.hasAspect('blueparapheur:paraphe_Paraphable');
		
	}
	
	function getManagedServices() {
		
		var 
			services = ServicesUtils.getManagedServices(),
			managedServices = Utils.Array.map(services, function(service) {
				var serviceName = service.shortName;
				if (ServicesUtils.isServiceManager(serviceName, _fullyAuthenticatedUserName)) return serviceName;
			})
		;
		
		return managedServices;
		
	}
	
	function getManagedUserNames(mangedServices) {
		
		var 
			managedUserHits = {},
			managedUserNames = []
		;
		
		managedServices = mangedServices || getManagedServices();
		
		Utils.Array.forEach(managedServices, function(serviceName) {
			
			Utils.Array.forEach(ServicesUtils.ROLES, function(roleName) {

				Utils.Array.forEach(ServicesUtils.getServiceRoleMembers(serviceName, roleName), function(user){
					
					var userName = Utils.asString(user.properties['userName']);
					if (!userName) return;
					
					if (undefined === managedUserHits[userName]) {
						managedUserHits[userName] = true;
						managedUserNames.push(userName);
					}
					
				});
				
			});
			
		});
		
		return managedUserNames;
		
	}
	
	function getTaskDescription(task, taskOwners) {
		
		var 
			taskId = task.id,
			taskName = task.name,
			taskOwner = Utils.asString(task.properties['cm:owner']),
			properties = Utils.Alfresco.BPM.getNonAlfrescoProperties(task),
			status = Utils.asString(task.properties['bpm:status']),
			
			description = {
				id : taskId,
				name : taskName,
				status : status,
				properties : properties,
				owners : Utils.Array.map(taskOwners || [], function(userName) {
					return userName + '|' + Utils.Alfresco.getPersonDisplayName(userName);
				}), 
				isOwner : _fullyAuthenticatedUserName == taskOwner,
				actions : Utils.keys(task.transitions)
			}
		;
		
		return description;
		
	}
		
	DatasourceDefinitions.register('SubrogatesMailTasks',
		{
			
			extend : 'Mails',
			
			searchAdditional : {
				
				listnodes : function(params) {
					
					// General case: retrieve all the nodes that get task on it
					var 
						managedServices = getManagedServices(),
						managedUserNames = getManagedUserNames(managedServices),
						managedServiceHits = Utils.Array.toMap(managedServices, function keyFunction(managedServiceName) {
							return managedServiceName;
						}),
						nodeHits = {},
						nodes = [],
						meta = {}
					;
					
					// A document is managed if it belongs to a managed service
					function isManagedDocument(document) {
						
						if (!DocumentUtils.isDocumentNode(document)) return false;
						
						var siteShortName = Utils.Alfresco.getEnclosingSiteName(document);
						if (null == siteShortName) return false;
						if (undefined === managedServiceHits[siteShortName]) return false;
						
						return true;
						
					}
										
					Utils.Array.forEach(managedUserNames, function(userName) {
						
						var tasks = workflowUtils.getTasksForUser(userName);
						
						Utils.Array.forEach(tasks, function(task) {
							
								var 
									document = (workflowUtils.getPackageResources(task) || [null])[0],
									taskId = Utils.asString(task.id),
									nodeRef
								; 
								
								if (null == document) return; // invalid workflow state => ignore
								if (!isManagedDocument(document)) {
									
									document = (document.sourceAssocs['blueparapheur:paraphe_Paraphable_paraphe_paraphe_Paraphe'] || [null])[0];
									if ( null == document || !isManagedDocument(document) ) return; 
									
								}

								nodeRef = Utils.asString(document.nodeRef);
								if (undefined == nodeHits[nodeRef]) {
									nodeHits[nodeRef] = true;
									nodes.push(document);
								}
								
								if (undefined === meta[nodeRef]) {
									meta[nodeRef] = {};
								}
								
								// Cache the current userName in the (Script)node
								if (undefined === meta[nodeRef].cachedTaskOwners) {
									meta[nodeRef].cachedTaskOwners = {};
									meta[nodeRef].cachedTasks = {};
								}
								meta[nodeRef].cachedTasks[taskId] = task;
								
								if (undefined === meta[nodeRef].cachedTaskOwners[taskId]) {
									meta[nodeRef].cachedTaskOwners[taskId] = [];
								}
								meta[nodeRef].cachedTaskOwners[taskId].push(userName);
								
							} )
						;
						
					});
					
					nodes.meta = meta;
					
					return nodes;
					
				}
				
			},
			
			fields : [
			          
				{
					
					name : 'tasks',
					evaluate : function(node, meta) {
						
						if (null == node) return [];

						var 
							nodeRef = Utils.asString(node.nodeRef),
							tasks = Utils.Object.values(meta[nodeRef].cachedTasks || {}),
							tasksOwners = meta[nodeRef].cachedTaskOwners || {}
						;
						
						return Utils.map(tasks, function(task) {
							
							var 
								taskId = task.id,
								taskOwners = tasksOwners[taskId] || []
							;
							
							return getTaskDescription(task, taskOwners);
							
						});
						
					}
				
				},
						
				{
					name : 'mytasks',
					evaluate : function(node) {
						return []; // discard
					}
				},
				
				{
					name : 'bptasks',
					evaluate : function(node) {						
						return []; // discard
					}
				}
				
			]
	
		}
		
	);

})();