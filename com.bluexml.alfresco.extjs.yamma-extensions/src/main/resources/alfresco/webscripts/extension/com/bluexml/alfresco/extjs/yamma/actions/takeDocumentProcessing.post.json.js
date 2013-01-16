///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/common.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/side/alfresco/extjs/actions/parseargs.lib.js">
///<import resource="classpath:/alfresco/webscripts/extension/com/bluexml/alfresco/extjs/yamma/actions/nodeaction.lib.js">

(function() {
	
	Yamma.Actions.TakeProcessingAction = Utils.Object.create(Yamma.Actions.InstructorDocumentNodeAction, {
		
		eventType : 'take-processing',
		
		isExecutable : function(node) {
			
			return ActionUtils.canTakeProcessing(node, this.fullyAuthenticatedUserName)
			
		},
		
		doExecute : function(node) {
			
			this.updateDocumentState(YammaModel.DOCUMENT_STATE_PROCESSING);
			
			this.updateDocumentHistory(
				'takeProcessing.comment', 
				[Utils.Alfresco.getPersonDisplayName(this.fullyAuthenticatedUserName)] 
			);
			
		}		
		
	});

	Yamma.Actions.TakeProcessingAction.execute();
	
})();