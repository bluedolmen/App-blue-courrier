///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	Yamma.Actions.UpdateDistributionAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		targetService : null,
		copyServices : null,
		distribute : false,
		
		wsArguments : [
			{ name : 'original', mandatory : true},
			{ name : 'copies' },
			{ name : 'distribute', defaultValue : 'false' }
		],		
		
		prepare : function() {
			
			Yamma.Actions.NodeAction.prepare.call(this);
			
			var 
				original = Utils.asString(this.parseArgs['original']),
				copies = Utils.asString(this.parseArgs['copies']),
				distribute = Utils.asString(this.parseArgs['distribute'])
			;

			this.distribute = 'true' === distribute;
			
			if (!ServicesUtils.isService(original)) {
				throw {
					code : 400,
					message : "The original service '" + original + "' is not a valid managed service" 
				};
			}
			this.targetService = original;
			
			this.copyServices = Utils.String.splitToTrimmedStringArray(copies);
			
			Utils.forEach(this.copyServices, function(serviceName) {
				
				if (!ServicesUtils.isService(serviceName)) {
					throw {
						code : 400,
						message : "The copy service '" + serviceName + "' is not a valid managed service" 
					};		
				}
				
			});				
			
		},
		
		doExecute : function(node) {
			
			var tasks = workflowUtils.getTasksForNode(node);
			if (null == tasks) return;
			
			var deliveringTasks = Utils.Alfresco.BPM.filterTasks(tasks, 'bcwfincoming:Delivering') || [];
			if (Utils.isArrayEmpty(deliveringTasks)) {
				logger.warn('Cannot find any *delivering* task on node ' + node.nodeRef + ', skipping.');
				return;
			}
			if (deliveringTasks.length > 1) {
				logger.warn('Found several delivering tasks on node ' + node.nodeRef + ', processing only the first: ' + task.id);
				return;				
			}
			
			var 
				task = deliveringTasks[0],
				properties = {}
			;
			
			// The following may reuse the distributeAction library
			
			if (null != this.targetService) {
				properties['bcwfincoming:targetService'] = this.targetService;
			}
			
			if (null != this.copyServices) {
				properties['bcwfincoming:copies'] = this.copyServices;
			}
	
			if (null != this.targetService || null != this.copyServices) {	
				workflowUtils.updateTaskProperties(task, properties);
			}
			
			if (!this.distribute) return; 
			task.endTask('distribute');
			
		}
				
	});

	Yamma.Actions.UpdateDistributionAction.execute();	
	
	
})();