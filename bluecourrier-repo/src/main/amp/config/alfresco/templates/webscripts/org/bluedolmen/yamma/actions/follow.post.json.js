///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {

	var followAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		isExecutable : function(node) {
			
			return Utils.Alfresco.hasPermission(node, 'Read', this.fullyAuthenticatedUserName);
			
		},
		
  		prepare : function() {
  			
  			this.operation = -1 != url.service.indexOf('unfollow') ? 'unfollow' : 'follow';
  			
  		},
				
		doExecute : function(node) {
			
			var me = this;
			
			if ('follow' == me.operation) {
				FollowingUtils.follow(node, me.fullyAuthenticatedUserName);
			}
			else if ('unfollow' == me.operation) {
				FollowingUtils.unfollow(node, me.fullyAuthenticatedUserName);
			}
			
//			status.setCode(status.STATUS_NO_CONTENT, 'No content');
		}
				
	});

	followAction.execute();	
	
})();