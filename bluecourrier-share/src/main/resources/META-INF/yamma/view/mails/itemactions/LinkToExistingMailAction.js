Ext.define('Yamma.view.mails.itemactions.LinkToExistingMailAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	uses : [
		'Yamma.view.windows.LinkToWindow'
	],
	
	text : i18n.t('view.mails.itemaction.linktoexistingmail.text'),//'Associer à un courrier existant',
	
	iconCls : Yamma.Constants.getIconDefinition('link').iconCls,
	
	isAvailable : function(record) {
		
		var kind = record.get(Yamma.utils.datasources.Documents.MAIL_KIND_QNAME);
		return (Yamma.utils.datasources.Documents.INCOMING_MAIL_KIND == kind);
		
	},
	
	execute : function(record, item, view) {
		
		var
		
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
		
			linkToWindow = Ext.create('Yamma.view.windows.LinkToWindow', {
				
				renderTo : Ext.getBody(),
				documentNodeRef : nodeRef,
				onSuccess : onSuccess
				
			})
		;
		
		linkToWindow.show();
		
		function onSuccess() {
			linkToWindow.close();
			if (view && view.panel) {
				view.panel.refresh();
				view.panel.fireEvent('threadchange', record);
			}
		}
	}
	
});