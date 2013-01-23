///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/send-utils.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">


(function() {	

	Yamma.Actions.ForwardForSendingAction = Utils.Object.create(Yamma.Actions.ManagerDocumentNodeAction, {
		
		eventType : 'forward-for-sending',
		
		isExecutable : function(node) {
			
			return ( 
				Yamma.Actions.ManagerDocumentNodeAction.isExecutable.apply(this, arguments) &&
				ActionUtils.canValidate(this.node, this.fullyAuthenticatedUserName) &&
				! ReplyUtils.hasSignableReplies(node)
			);
			
		},
		
		doExecute : function(node) {
			
			SendUtils.sendDocument(this.node);
			this.updateDocumentHistory('forwardForSending.comment' /* msgKey */);
			
		}		
		
	});

	Yamma.Actions.ForwardForSendingAction.execute();

})();