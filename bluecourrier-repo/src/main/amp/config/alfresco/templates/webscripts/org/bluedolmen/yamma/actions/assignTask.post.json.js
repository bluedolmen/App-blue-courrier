///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	Yamma.Actions.AssignTaskAction = Utils.Object.create(Yamma.Actions.TaskDocumentNodeAction, {
		
		assignee : null,
		authenticatedUserName : Utils.Alfresco.getFullyAuthenticatedUserName(),
				
		wsArguments : [
			'assignee'
		],
		
		prepare : function() {
			
			Yamma.Actions.TaskDocumentNodeAction.prepare.call(this);
			
			this.assignee = Utils.wrapString(this.parseArgs['assignee']);
			
			if (null == this.assignee) {
				this.assignee = Utils.Alfresco.getFullyAuthenticatedUserName();
			}
			
		},
		
		/*
		 * A task can be (re-)assigned by a user, if:
		 * - he is one of the pooled actors and the task has not been assigned yet
		 * OR
		 * - he is a manager of the document enclosing-service
		 * - he is one of the delegate of the allowed actors
		 */
		isExecutable : function(task) {
			
			// he is one of the pooled actors and the task has not been assigned yet
			var taskEditable = workflowUtils.isTaskEditable(task);
			if (taskEditable) return true;
			
			var enclosingServiceName = Utils.Alfresco.getEnclosingSiteName(this.node);
			if (ServicesUtils.isServiceManager(enclosingServiceName, this.authenticatedUserName)) return true;

			var serviceManagers = ServicesUtils.getServiceRoleMembers(enclosingServiceName, "ServiceManager");
			return Utils.exists(serviceManagers, function(manager) {
				var managerUserName = manager.properties['cm:userName'];
				return delegates.isDelegate(managerUserName, this.authenticatedUserName);
			});
			
		},
		
		doExecute : function(task) {
			
			workflowUtils.claimTask(task, this.assignee /* userName */, true /* force */);
				
		}

	});
	
	Yamma.Actions.AssignTaskAction.execute();
	
})();