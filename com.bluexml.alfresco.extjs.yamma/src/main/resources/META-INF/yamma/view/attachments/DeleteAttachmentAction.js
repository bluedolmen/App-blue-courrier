Ext.define('Yamma.view.attachments.DeleteAttachmentAction', {

	DELETE_ATTACHMENT_ACTION_ICON : Yamma.Constants.getIconDefinition('attach_delete'),
	
	getDeleteAttachmentActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : this.DELETE_ATTACHMENT_ACTION_ICON.icon,
			tooltip : "Supprimer l'attachement",
			handler : this.onDeleteAttachmentAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchDeleteAttachmentAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchDeleteAttachmentAction : function(record) {
		
		var canDelete = record.get('canDelete');
		return !!canDelete;
		
	},
	
	onDeleteAttachmentAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			attachmentNodeRef = this.getAttachmentNodeRefRecordValue(record),
			attachmentName = this.getAttachmentNameRecordValue(record)
		;
		
		this.deleteAttachment(attachmentNodeRef, attachmentName);
		
	},
	
	getAttachmentNodeRefRecordValue : function(record) {
		return record.get('nodeRef');
	},
	
	getAttachmentNameRecordValue : function(record) {
		return record.get('name'); // this is a derived field
	},
	
	deleteAttachment : function(attachmentNodeRef, attachmentName) {
		
		var 
			me = this,
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				'alfresco:///bluexml/yamma/attachment/' + attachmentNodeRef.replace(':/','')
			)
		;
		
		Bluexml.windows.ConfirmDialog.INSTANCE.askConfirmation(
			"Supprimer l'attachement ?", /* title */
			Ext.String.format("Êtes-vous certain de vouloir supprimer l'attachement<br/><b>{0}</b>", attachmentName), /* message */
			deleteAttachment /* onConfirmation */
		);
		
		function deleteAttachment() {
			
			Bluexml.Alfresco.jsonRequest(
				{
					method : 'DELETE',
					url : url,
					onSuccess : function() {
						me.refresh();
					}
				}
			);	
			
		}
		
		
		
	}
});