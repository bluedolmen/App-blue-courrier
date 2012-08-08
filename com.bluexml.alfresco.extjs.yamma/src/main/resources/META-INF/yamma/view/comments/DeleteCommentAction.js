Ext.define('Yamma.view.comments.DeleteCommentAction', {

	DELETE_COMMENT_ACTION_ICON : Yamma.Constants.getIconDefinition('comment_delete'),
	
	getDeleteCommentActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : this.DELETE_COMMENT_ACTION_ICON.icon,
			tooltip : 'Supprimer le commentaire',
			handler : this.onDeleteCommentAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchDeleteCommentAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchDeleteCommentAction : function(record) {
		
		var canDelete = record.get('canDelete');
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
		
		Bluexml.windows.ConfirmDialog.INSTANCE.askConfirmation(
			'Supprimer le commentaire ?', /* title */
			'êtes-vous certain de vouloir supprimer le commentaire ?', /* message */
			deleteComment /* onConfirmation */
		);
		
		function deleteComment() {
			
			var
				url = Bluexml.Alfresco.resolveAlfrescoProtocol(
					'alfresco://api/comment/node/' + commentNodeRef.replace(/:\//,'')
				)
			;
			
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