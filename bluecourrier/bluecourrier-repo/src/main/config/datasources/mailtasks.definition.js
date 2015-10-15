(function() {
	
//	function isParaphe(node) {
//		
//		if (null == node) return false;
//		return node.hasAspect('blueparapheur:paraphe_Paraphable');
//		
//	}
//	
	DatasourceDefinitions.register('MailTasks',
		{
			
			extend : 'Mails',
			
			searchAdditional : {
				
				listnodes : function(params) {
					
					// Try to filter on a given node
					var 
						nodeRefFilterValue = params.getFilterValue('nodeRef'),
						includeFollowed = "true" == Utils.asString(params.getFilterValue('includeFollowed')),
						node = null,
						myTasks = null,
						indexedNodes = {},
						followedNodes
					;
					
					// nodeRef filter
					if (nodeRefFilterValue) {
						node = Utils.Alfresco.getExistingNode(nodeRefFilterValue, true /* failsSilently */);
						if (!node) return [];
						
						myTasks = BPMUtils.getMyNodeTasks(node);
						return Utils.isArrayEmpty(myTasks) ? [] : [node];
					}
					
					// General case: retrieve all the nodes that get task on it
					myTasks = Utils.Alfresco.BPM.getMyTasks();
					
					Utils.forEach(myTasks, function(task) {
					
						var document = (workflowUtils.getPackageResources(task) || [null])[0]; 
						if (null == document) return; // ignore
						if (!DocumentUtils.isDocumentNode(document)) return;
						
						indexedNodes[document.nodeRef] = document;
						
					} );
					
					if (includeFollowed) {
						// Returns additional followed nodes discarding the nodes which already have at least one task 
						
						followedNodes = FollowingUtils.getFollowedNodes(null/*, { aspects : [YammaModel.MAIL_ASPECT_SHORTNAME] }*/);
						
						Utils.forEach(followedNodes, function(node) {
							
							var nodeRef = node.nodeRef;
							
							node = indexedNodes[nodeRef] || node;
							node.properties['followed'] = true; // DO NOT SAVE since it is a temporary value
							
							indexedNodes[nodeRef] = node;
							
						});
						
					}
					
					return Utils.Object.values(indexedNodes);
					
				}
				
			},
			
			fields : [
						
				{
					name : YammaModel.FOLLOWING_ASPECT_SHORTNAME + '_followed',
					type : 'boolean',
					evaluate : function(node) {
						return node.properties['followed'];
					}
				},
				
				YammaModel.DISTRIBUTABLE_SHARES_PROPNAME
			
			]
	
		}
		
	);

})();