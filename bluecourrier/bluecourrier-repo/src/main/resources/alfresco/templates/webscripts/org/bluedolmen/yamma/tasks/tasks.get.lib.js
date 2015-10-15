
(function() {
	
	TasksLib = {
		
		getBlueCourrierTasks : function(userName) {
			
			var myTasks = Utils.Alfresco.BPM.getMyTasks();
			
			return Utils.filter(myTasks, function(task) {
				
					var document = (workflowUtils.getPackageResources(task) || [null])[0]; 
					if (null == document) return; // ignore
					if (DocumentUtils.isDocumentNode(document)) return true;
					
					var paraphable = (document.sourceAssocs['blueparapheur:paraphe_Paraphable_paraphe_paraphe_Paraphe'] || [null])[0];
					if (null != paraphable && DocumentUtils.isDocumentNode(paraphable) ) return true; 
					
					return false;
					
				} )
			;			
			
		},
			
		getTasks : function(userName) {
			
			if (null == userName) {
				if (null == person) { // authenticated ?
					throw new Error("IllegalStateException! The user is not authenticated and cannot be determined");
				}
				userName = person.properties['cm:userName'];
			}
			
			return workflowUtils.getTasksForUser(userName);
			
		},
			
		getCount : function(tasks) {
			
			var result = {};
			
			Utils.forEach(tasks, function(task) {
				
				var taskName = Utils.asString(task.name);
				if (!taskName) return;
				
				if (undefined === result[taskName]) {
					result[taskName] = 0;
				}
				
				result[taskName] = result[taskName] + 1;
				
			});
			
			return result;
			
		},
		
		getLateState : function(tasks, lateState) {
			
			if (undefined === lateState) {
				lateState = YammaModel.LATE_STATE_LATE;
			}
			
			var result = {};
			
			Utils.forEach(tasks, function(task) {
				
				var taskName = Utils.asString(task.name);
				if (!taskName) return;
				
				if (undefined === result[taskName]) {
					result[taskName] = 0;
				}
				
				var document = (task.getPackageResources() || [])[0];
				if (null == document) return;
				
				var lateState_ = DocumentUtils.getLateState(document);
				
				if (lateState != lateState_) return; 
				result[taskName] = result[taskName] + 1;
				
			});
			
			return result;
			
		},
		
		getLastUpdate : function(tasks) {
			
			var result = {};
			
			Utils.forEach(tasks, function(task) {
				
				var 
					taskName = Utils.asString(task.name),
					startDate = null
				;
				if (!taskName) return;
				
				startDate = task.properties['bpm:startDate'] || task.properties['cm:created'];
				if (null == startDate) return;
				
				if (undefined === result[taskName] || result[taskName].before(startDate)) {
					result[taskName] = startDate;
				}
				
			});
			
			return result;
			
		},
		
		getTaskDescription : function(task, userName) {
			
			var 
				taskId = task.id,
				taskName = task.name,
				taskOwner = Utils.asString(task.properties['cm:owner']),
				properties = Utils.Alfresco.BPM.getNonAlfrescoProperties(task),
				description = {
					id : taskId,
					name : taskName,
					properties : properties,
					owner : userName == taskOwner,
					actions : Utils.keys(task.transitions)
				}
			;
			
			return description;
			
		}		
	
	};
	
})();
