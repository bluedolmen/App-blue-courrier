Ext.define('Yamma.view.mails.itemactions.StopFollowingAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	text : i18n.t('view.mails.itemaction.stopfollowing.text'),//'Arrêter de suivre',
	
	iconCls : Yamma.Constants.getIconDefinition('feed_delete').iconCls,
	
	isAvailable : function(record) {
		
		var followed = record.get(Yamma.utils.datasources.Documents.IS_FOLLOWED_QNAME);
		return followed;
		
	},
	
	execute : function(record, item, view) {
		
		var
			me = this,
			nodeRef = record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/unfollow')
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