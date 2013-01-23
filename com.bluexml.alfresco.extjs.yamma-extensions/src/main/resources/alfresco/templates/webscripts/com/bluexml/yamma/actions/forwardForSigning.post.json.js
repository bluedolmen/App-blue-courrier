///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">


(function() {
	
	Yamma.Actions.ForwardForSigningAction = Utils.Object.create(Yamma.Actions.ManagerDocumentNodeAction, {
		
		eventType : 'forward-for-signing',
		
		isExecutable : function(node) {
			
			return ( 
				Yamma.Actions.ManagerDocumentNodeAction.isExecutable.apply(this, arguments) &&
				ActionUtils.canValidate(this.node, this.fullyAuthenticatedUserName) &&
				ReplyUtils.hasSignableReplies(node)
			);
			
		},
		
		doExecute : function(node) {
			
			this.updateDocumentState(YammaModel.DOCUMENT_STATE_SIGNING);
			this.updateDocumentHistory('forwardForSigning.comment' /* msgKey */);
			
		}		
		
	});

	Yamma.Actions.ForwardForSigningAction.execute();	

})();