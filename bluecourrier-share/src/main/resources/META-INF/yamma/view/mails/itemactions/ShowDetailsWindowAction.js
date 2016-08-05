Ext.define('Yamma.view.mails.itemactions.ShowDetailsWindowAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	uses : [
		'Yamma.view.windows.DetailsWindow'
	],	
	
	text : 'Fiche détaillée',
	
	iconCls : Yamma.Constants.getIconDefinition('application_view_detail').iconCls,
	
	isAvailable : true,
	
	execute : function(record, item, view) {
		
		var 
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			detailsWindow = Ext.create('Yamma.view.windows.DetailsWindow', {
				documentNodeRef : nodeRef
			})
		;
		
		detailsWindow.show();
		
	}
	
});