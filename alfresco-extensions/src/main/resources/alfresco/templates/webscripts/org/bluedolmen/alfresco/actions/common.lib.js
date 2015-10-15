(function() {
	
	var GENERIC_SENDMAIL_ERROR_MESSAGE = "Erreur durant l'envoi des notifications par email";
	
	Common = {
		
		getExistingNode : function(nodeRef) {
			if (!nodeRef) return null;
			
			var documentNode = search.findNode(nodeRef);
			if (null == documentNode) {
				throw new Error("IllegalStateException! The document-node with nodeRef '" + nodeRef + "' does not exist");
			}
			
			return documentNode;
		},

		
		getFirstAvailableTask : function(node) {
			var activeWorkflows = node.activeWorkflows;
			if (!activeWorkflows || activeWorkflows.length == 0) return null;
			
			var 
				firstWorkflow = activeWorkflows[0],
				paths = firstWorkflow.getPaths()
			;
			if (!paths || paths.length == 0) return null;
			
			var 
				firstPath = paths[0],
				tasks = firstPath.getTasks()
			;
			if (!tasks || tasks.length == 0) return null;
			
			return tasks[0];			
		},
		
		removeFolderChildren : function(folderNode) {
			if (null == folderNode) return;
			
			var children = folderNode.children;
			for (var i = 0, len = children.length; i < len; i++) {
				var child = children[i];
				child.remove();
			}
		},
		
		securedExec : function(exec, silent, finalExec) {
			
			try {
				
				exec();
				
			} catch (e) {
				
				var 
					code = parseInt('' + e.code || '500'),
					message = 'string' == typeof e ? e : (e.message || '')
				;
				
				silent = 'undefined' == typeof silent ? false : !!silent;
				
				if (code >= 0) {
					status.code = code;
				}
				if (message) { 
					status.message = message;
				}
				
				if (code >= 200 && code <300) { 
					// any form of success => Code has not been set correctly
					if (message) {
						status.setCode(Status.STATUS_INTERNAL_SERVER_ERROR, message);
					}
					
				}
				
				if (true !== silent) throw e;
				
			} finally {
				
				if (finalExec) finalExec();
				
			}
			
		}
		
		
		
		
	}
	
})();
