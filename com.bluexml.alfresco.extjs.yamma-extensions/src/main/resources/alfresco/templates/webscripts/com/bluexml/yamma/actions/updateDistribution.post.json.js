///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/distributeAction.lib.js">

(function() {
	
	Yamma.Actions.UpdateDistributionAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		originalService : null,
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
					code : '412',
					message : "The original service '" + original + "' is not a valid managed service" 
				}
			}
			this.originalService = original;
			
			this.copyServices = Utils.map(copies.split(','), function(serviceName) {
				
				serviceName = Utils.String.trim(serviceName);
				if (0 == serviceName.length) return;
				
				if (!ServicesUtils.isService(serviceName)) {
					throw {
						code : '412',
						message : "The copy service '" + serviceName + "' is not a valid managed service" 
					}					
				}
				
				return serviceName;
				
 			});			
			
		},
		
		doExecute : function(node) {
			
			DocumentUtils.setAssignedService(node, this.originalService);
			DocumentUtils.setDistributedServices(node, this.copyServices);
			if (!this.distribute) return; 
			
			Yamma.Actions.DistributeAction.execute();
			
		}
				
	});

	Yamma.Actions.UpdateDistributionAction.execute();	
	
	
})();