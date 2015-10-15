Ext.define('Yamma.view.mails.itemactions.RestartProcessingAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	text : 'Relancer le traitement du document',
	
	iconCls : Yamma.Constants.getIconDefinition('pencil_go').iconCls,
	
	isAvailable : function(record) {
		
		var 
			processedBy = record.get(Yamma.utils.datasources.Documents.PROCESSED_BY_QNAME),
			state = record.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME),
			enclosingServiceName = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE)
		;
		
		if ('processed' != state) return false;
		
		if (Bluedolmen.Alfresco.getCurrentUserName() == processedBy) return true;
		
		var enclosingService = Yamma.utils.ServicesManager.getDescription(enclosingServiceName);
		if (null == enclosingService) return false;
		
		return enclosingService.membership && true == enclosingService.membership.ServiceManager;
		
	},
	
	execute : function(record, item, view) {
		
		var
			me = this,
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/restart-incoming')
		;
		
		Bluedolmen.Alfresco.jsonPost({
			
			url : url,
			
			dataObj : {
				nodeRef : nodeRef
			},
			
			onSuccess : function(response, options) {
				me.refresh();
			}
			
		});
		
		
	}
	
});