///<import resource="classpath:/alfresco/extension/bluedolmen/yamma/common/yamma-env.js">
///<import resource="classpath:/alfresco/templates/webscripts/org/bluedolmen/yamma/actions/nodeaction.lib.js">

(function() {
	
	Yamma.Actions.ArchiveAction = Utils.Object.create(Yamma.Actions.DocumentNodeAction, {
		
		eventType : 'archive',
		
		isExecutable : function(node) {
			
			return ActionUtils.canArchive(node, this.fullyAuthenticatedUserName)
			
		},
		
		doExecute : function(node) {
			
			this.updateDocumentState(YammaModel.DOCUMENT_STATE_ARCHIVED);
			this.updateDocumentHistory('archiveDocument.comment');
			
			ArchivesUtils.moveToArchives(node);
			
		}
		
	});

	Yamma.Actions.ArchiveAction.execute();	
	
})();