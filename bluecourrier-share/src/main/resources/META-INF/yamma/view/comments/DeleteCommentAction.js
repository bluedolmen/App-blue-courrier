Ext.define('Yamma.view.comments.DeleteCommentAction', {

	DELETE_COMMENT_ACTION_ICON : Yamma.Constants.getIconDefinition('comment_delete'),
	
	getDeleteCommentActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : this.DELETE_COMMENT_ACTION_ICON.icon,
			tooltip :  i18n.t('view.comments.deletecommentaction.definition.tooltip'),
			handler : this.onDeleteCommentAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchDeleteCommentAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchDeleteCommentAction : function(record) {
		
		var 
			permissions = record.get('permissions'),
			canDelete = permissions["delete"]
		;
		
		return !!canDelete;
		
	},
	
	onDeleteCommentAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			commentNodeRef = this.getCommentNodeRefRecordValue(record)
		;
		
		this.deleteComment(commentNodeRef);
		
	},
	
	getCommentNodeRefRecordValue : function(record) {
		return record.get('nodeRef');
	},
	
	deleteComment : function(commentNodeRef) {
		
		var me = this;
		
		Bluedolmen.windows.ConfirmDialog.INSTANCE.askConfirmation(
			i18n.t('view.comments.deletecommentaction.dialog.confirm.title'), /* title */
			i18n.t('view.comments.deletecommentaction.dialog.confirm.message'), /* message */
			deleteComment /* onConfirmation */
		);
		
		function deleteComment() {
			
			var
				url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(
					'alfresco://api/comment/node/' + commentNodeRef.replace(/:\//,'')
				)
			;
			
			Bluedolmen.Alfresco.jsonRequest(
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