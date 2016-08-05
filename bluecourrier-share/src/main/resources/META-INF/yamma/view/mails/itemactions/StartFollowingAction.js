Ext.define('Yamma.view.mails.itemactions.StartFollowingAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	text : 'Ajouter aux courriers suivis',
	
	iconCls : Yamma.Constants.getIconDefinition('feed_add').iconCls,
	
	isAvailable : function(record) {
		
		var followed = record.get(Yamma.utils.datasources.Documents.IS_FOLLOWED_QNAME);
		return !followed;
		
	},
	
	execute : function(record, item, view) {
		
		var
			me = this,
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/follow')
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