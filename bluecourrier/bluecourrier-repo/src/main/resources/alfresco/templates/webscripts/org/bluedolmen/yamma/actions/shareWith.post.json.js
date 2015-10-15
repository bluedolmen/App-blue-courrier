///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/distributeAction.lib.js">

(function() {
	
	var shareWithAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		shares : null,
		
		wsArguments : [
   			{ name : 'shares', mandatory : true }
   		],
   				
   		prepare : function() {
   			
   			var shares = Utils.asString(this.parseArgs['shares']);
   			this.shares = Yamma.DeliveryUtils.decode(shares, true /* performCheck */);
   			this.fullyAuthenticatedUserName = Utils.Alfresco.getFullyAuthenticatedUserName();
   			
   		},		

		
		isExecutable : function(node) {
			
			return Utils.Alfresco.hasPermission(node, 'Read', this.fullyAuthenticatedUserName);
			
		},
		
		doExecute : function(node) {
			
   			var hasWritePermission = Utils.Alfresco.hasPermission(node, 'Write', this.fullyAuthenticatedUserName);   			
			
			// Compute added copies
			var 
				me = this,
				currentShares = Yamma.DeliveryUtils.getCurrentShares(node),
				addedShares = me.shares.difference(currentShares)
			;
			
			if (addedShares.isEmpty()) return; // only manages added copies for now
			
			if (!Utils.Array.isEmpty(addedShares.services)) {
				logger.warn('NotSupported! Cannot add new service shares.');
			}
			
			if (!Utils.Array.isEmpty(addedShares.externalUsers)) {
				logger.warn('NotSupported! Cannot add external users shares.');
			}
			
			if (Utils.Array.isEmpty(addedShares.localUsers)) return;

			
			Utils.forEach(addedShares.localUsers, function(localUser) {
				
				var userName = localUser.name;
				if (!userName) return;

				Yamma.DeliveryUtils.shareWithUser (node, userName, {
					role : ( hasWritePermission && localUser.role == 'contributor' ? 'contributor' : 'consumer' )
				});
				
			});
			
			// Update history
			var 
			
				localUsers = Utils.map(addedShares.localUsers, function(localUser) {
					return Utils.Alfresco.getPersonDisplayName(localUser.name) + (hasWritePermission && localUser.role && 'contributor' == localUser.role ? ' (avis)' : '');
				}),
										
				comment = Utils.String.join(localUsers, ', ')
			;
			
			HistoryUtils.addEvent(node, {
				eventType : 'sharedWith',
				key : 'yamma.actions.shared.users.comment',
				args : [ comment ]
			});
			
		},
		
		
	});
	

	shareWithAction.execute();	
	
})();