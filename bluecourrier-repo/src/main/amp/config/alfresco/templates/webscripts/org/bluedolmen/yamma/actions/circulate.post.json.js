///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var circulateAction = Utils.Object.create(Yamma.Actions.NodeAction, {
		
		addedShares : null,
		
		wsArguments : [
   			{ name : 'shares', mandatory : true }
   		],
   				
   		prepare : function() {
   			
   			var 
   				shares = Utils.asString(this.parseArgs['shares'])
   			;
   			this.shares = Yamma.DeliveryUtils.decode(shares, true /* performCheck */);
   			
   			this.fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
   			
   		},		

		
		isExecutable : function(node) {
			
			return Utils.Alfresco.hasPermission(node, 'Read', this.fullyAuthenticatedUserName);
			
		},
		
		doExecute : function(node) {
			
   			var 
   				me = this,
   				hasWritePermission = Utils.Alfresco.hasPermission(node, 'Write', this.fullyAuthenticatedUserName),
   				currentShares,
   				addedShares
   			;
   			
   			currentShares = Yamma.DeliveryUtils.getCurrentShares(node).filterServicesBy(null, ['ongoing','pending']);
   			addedShares = this.shares.difference(currentShares);
			
			if (addedShares.isEmpty()) return; // only manages added copies for now
			
			this._addLocalUsers(addedShares.localUsers);
			this._addServices(addedShares.services);
			this._addGroups(addedShares.groups);
			this._updateHistory(addedShares);
			
		},
		
		_addLocalUsers : function(localUsers) {
			
			var me = this;
			
			Utils.forEach(localUsers, function(localUser) {
				
				var userName = localUser.name;
				if (!userName) return;

				Yamma.DeliveryUtils.shareWithUser (me.node, userName);
				
			});
			
		},
		
		_addGroups : function(groups) {
			
			var me = this;
			
			Utils.forEach(groups, function(group) {
				
				var groupName = group.name;
				if (!groupName) return;

				Yamma.DeliveryUtils.shareWithGroup (me.node, groupName);
				
			});
			
		},
		
		_addServices : function(services) {
			
			var node = this.node;
			
			if (Utils.Array.isEmpty(services)) return;
			

			// TODO: Refactor this part exploring
			// active-workflows on the node (not
			// bug-free while considering several
			// delivering workflows on the same
			// node)
			if (!incomingWorkflowHelper.isAcceptingDelivery(node)) {
				Yamma.DeliveryUtils.startIncomingWorkflow(node, false /* validateDelivery */, {startingMode : 'waiting'});
			}
			
			Utils.forEach(services, function(service) {
				
				var serviceName = service.name;
				if (!serviceName) return;

				incomingWorkflowHelper.addDeliveryService(node, serviceName);
				
			});
			
		},
		
		_updateHistory : function(addedShares) {
			
			// Update history
			var comment = addedShares.toString();
			
			HistoryUtils.addEvent(this.node, {
				eventType : 'circulate',
				key : 'yamma.actions.circulate.comment',
				args : [ comment ]
			});
			
		}
		
	});

	circulateAction.execute();	
	
})();