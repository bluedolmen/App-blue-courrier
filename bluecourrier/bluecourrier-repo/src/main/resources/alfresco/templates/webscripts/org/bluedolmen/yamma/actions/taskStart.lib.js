(function() {
	
	Yamma.Actions.TaskStartAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		doExecute : function(task) {

			/*
			 * Actually, we should call TaskInstance.start() to get the proper result,
			 * meaning :
			 * - Changing the status of the task
			 * - Setting the starting date
			 * - Launching the task-start event
			 * BUT the JBPM Engine does not expose the TaskInstance Object nor implement
			 * the start() method.
			 * As a consequence, we have to provide an alternative method setting the
			 * status and the start date.
			 * However, the 'task-start' event will NOT be raised!
			 * Also the startDate property is not mapped to the taskInstance Object; thus
			 * it will NOT be actually applied to the jbpm task.
			 * 
			 * Finally, the only useful piece of information is the status (status other
			 * than 'Not Yet Started' and 'Completed' seem to be unused by Alfresco)
			 */
			
			var taskStatus = Utils.Alfresco.BPM.getTaskStatus(task);
			if (Utils.Alfresco.BPM.TaskStatus.IN_PROGRESS == taskStatus) {
				throw "IllegalStateException! The task " + task.id + " is already started.";
			}
			
			BPMUtils.setTaskStatus(task, BPMUtils.TaskStatus.IN_PROGRESS);
			
		}

	});
	
})();