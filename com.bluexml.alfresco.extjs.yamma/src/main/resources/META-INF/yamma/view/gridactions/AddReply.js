Ext.define('Yamma.view.gridactions.AddReply', {

	extend : 'Bluexml.utils.alfresco.grid.GridAction',
	
	uses : [
		'Yamma.utils.ReplyUtils'
	],
	
	icon : Yamma.Constants.getIconDefinition('email_go_add').icon,
	tooltip : 'Ajouter un fichier réponse',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_REPLY,	
		
	supportBatchedNodes : false,
	managerAction : false,
	
	isAvailable : function(record, context) {
		
		var
			hasReplies = record.get(Yamma.utils.datasources.Documents.MAIL_HAS_REPLIES_QNAME)
		;
		
		return (
			this.callParent(arguments) &&
			!hasReplies
		);
				
	},
	
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME);	
	},	
	
	launchAction : function(record, item, e) {
		
		var 
			me = this,
			documentNodeRef = this.getDocumentNodeRefRecordValue(record),			
			fileSelectionMenu = Yamma.utils.ReplyUtils.getFileSelectionReplyMenu(onItemClick)
		;
		
		fileSelectionMenu.showAt(e.getXY());
					
		this.callParent();
		
		function onItemClick(menu, item, e) {
			
			if (!item) return;
			
			var action = item.action;
			Yamma.utils.ReplyUtils.replyFromItemAction(
				action,
				documentNodeRef,
				null, /* updateReplyNodeRef */
				onSuccess
			);
			
		}
		
		function onSuccess() {
			
			var 
				grid = me.grid,
				displayView = ( Ext.ComponentQuery.query('displayview') || [])[0]
			;		
			if (!grid) return;
			if (!displayView) return;
			
			grid.refreshSingle(documentNodeRef, 'nodeRef');
			displayView.fireEvent('update', 'replies');
			
		}

	}
	
});