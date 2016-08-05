(function() {
	
	var _fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
		
	function _getTaskDescription(task) {
		
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
				owner : _fullyAuthenticatedUserName == taskOwner,
				actions : Utils.keys(workflowUtils.getTransitions(task))
			}
		;
		
		return description;
		
	}
	
	function getMyNodeTaskDescriptions(node, cachedNodes) {
		
		if (null == node) return [];
		
		var myTasks = Utils.Alfresco.BPM.getMyNodeTasks(
			node, 
			true, /* includePooled */ 
			false, /* resetCached */
			true /* pooledCachedValues */
		);
		
		return Utils.map(myTasks, function(task){
			return _getTaskDescription(task);
		});
		
	};
		
	DatasourceDefinitions.register('MyTasks',
		{
			
			fields : [
			          
				{
					name : 'mytasks',
					evaluate : function(node) {
						
						if (null == node) return [];
						return getMyNodeTaskDescriptions(node);
						
					}
				},
				
//				/*
//				 * BlueParapheur tasks lead on a Paraphe object which
//				 * is associated to the current document.
//				 */
//				{
//					name : 'bptasks',
//					evaluate : function(node) {
//						
//						if (null == node) return [];
//						
//						var 
//							parapheAssocs = node.assocs['blueparapheur:paraphe_Paraphable_paraphe_paraphe_Paraphe'] || [null],
//							paraphe = parapheAssocs[0]
//						;
//						if (null == paraphe) return [];
//						
//						return getMyNodeTaskDescriptions(paraphe);
//						
//					}
//				},
				
				{
					name : 'hasworkflows',
					type : 'boolean',
					evaluate : function(node) {
						
						if (null == node) return false;
						
						var activeWorkflows = node.activeWorkflows;
						if (null == activeWorkflows) return false;
						
						return !Utils.isArrayEmpty(activeWorkflows);
												
					}
				}
			]
	
		}
		
	);
	

})();