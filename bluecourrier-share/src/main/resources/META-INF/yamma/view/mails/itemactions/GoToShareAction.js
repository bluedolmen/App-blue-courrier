Ext.define('Yamma.view.mails.itemactions.GoToShareAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	text : 'Ouvrir dans la GED',
	
	iconCls : Yamma.Constants.getIconDefinition('database_go').iconCls,
	
	isAvailable : function(record) {
		
		var enclosingServiceName = record.get(Yamma.utils.datasources.Documents.ENCLOSING_SERVICE);
		return enclosingServiceName;
		
	},
	
	execute : function(record, item, view) {
		
		var
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			
			url = '/share/page/document-details?nodeRef={nodeRef}'
				.replace(/\{nodeRef\}/, nodeRef)
		;
		
		window.open(url);
		
	}
	
});