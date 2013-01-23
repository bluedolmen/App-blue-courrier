///<import resource="classpath:/alfresco/extension/com/bluexml/alfresco/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/com/bluexml/yamma/actions/nodeaction.lib.js">

(function() {
	
	const PDF_MIMETYPE = 'application/pdf';
	
	Yamma.Actions.PrintAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'print',
		failOnError : false,
		
		isExecutable : function(node) {
			
			return ActionUtils.canMarkAsSent(node, this.fullyAuthenticatedUserName);
			
		},
		
		prepare : function() {
			
		},
		
		doBatchExecute : function() {
			Yamma.Actions.DocumentNodeAction.doBatchExecute.call(this);
		},
		
		doExecute : function(node) {
			
			
			
		},
		
		transformToPdf : function() {
			
			var transformedDocument = this.node.transformDocument(PDF_MIMETYPE);
			return transformedDocument;
			
		}
		
		
	});

	Yamma.Actions.PrintAction.execute();	
	
	
})();