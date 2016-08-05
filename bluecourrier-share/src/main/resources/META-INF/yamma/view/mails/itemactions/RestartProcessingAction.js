Ext.define('Yamma.view.mails.itemactions.RestartProcessingAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	text : 'Relancer le traitement du document',
	
	iconCls : Yamma.Constants.getIconDefinition('pencil_go').iconCls,
	
	isAvailable : function(record, currentUser) {
		
		var 
			state = record.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME),
			enclosingServiceName = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			mailKind = record.get(Yamma.utils.datasources.Documents.MAIL_KIND_QNAME),
			enclosingService, membership
		;
		
		if ('processed' != state) return false;
		if (Yamma.utils.datasources.Documents.INCOMING_MAIL_KIND != mailKind) return false;
		
		if (currentUser && currentUser.isApplicationAdmin()) return true;
		
		enclosingService = Yamma.utils.ServicesManager.getDescription(enclosingServiceName);
		if (null == enclosingService) return false;
		
		membership = enclosingService.get('membership') || {};
		
		return (true === membership.ServiceAssistant);
		
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