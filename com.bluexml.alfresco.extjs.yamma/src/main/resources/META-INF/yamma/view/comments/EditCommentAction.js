Ext.define('Yamma.view.comments.EditCommentAction', {

	EDIT_COMMENT_ACTION_ICON : Yamma.Constants.getIconDefinition('comment_edit'),
	
	getEditCommentActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : this.EDIT_COMMENT_ACTION_ICON.icon,
			tooltip : 'Éditer le commentaire',
			handler : this.onEditCommentAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchEditCommentAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchEditCommentAction : function(record) {
		
		var canEdit = record.get('canEdit');
		return !!canEdit;
		
	},
	
	onEditCommentAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			commentNodeRef = this.getCommentNodeRefRecordValue(record),
			commentContent = this.getCommentContentRecordValue(record)
		;
		
		this.editComment(commentNodeRef, commentContent);
		
	},
	
	getCommentNodeRefRecordValue : function(record) {
		return record.get('nodeRef');
	},
	
	getCommentContentRecordValue : function(record) {
		return record.get('cm:content');
	},
	
	editComment : function(commentNodeRef, content) {
		
		var me = this;
		
		Yamma.view.comments.PromptMessageBox.prompt(
			{
				title : 'Éditer un commentaire',
				callback : function(buttonId, text, opt) {
					
					if ('ok' !== buttonId) return;
					editComment(text);
					
				},
				value : content
			}
		);
		
		function editComment(comment) {
			
			var
				url = Bluexml.Alfresco.resolveAlfrescoProtocol(
					'alfresco://api/comment/node/' + commentNodeRef.replace(/:\//,'')
				)
			;
			
			Bluexml.Alfresco.jsonRequest(
				{
					method : 'PUT',
					url : url,
					dataObj : {
						content : comment
					},
					onSuccess : function() {
						me.refresh();
					}
				}
			);	
			
		}
		
		
		
	}
});