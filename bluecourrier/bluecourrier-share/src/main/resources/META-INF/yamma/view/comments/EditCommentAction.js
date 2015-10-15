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
		
		var 
			permissions = record.get('permissions'),
			canEdit = permissions["edit"]
		;
		
		return !!canEdit;
		
	},
	
	onEditCommentAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			record = grid.getStore().getAt(rowIndex),
			commentNodeRef = this.getCommentNodeRefRecordValue(record),
			commentContent = this.getCommentContentRecordValue(record)
		;
		
		this.editComment(commentNodeRef, commentContent, record);
		
	},
	
	getCommentNodeRefRecordValue : function(record) {
		return record.get('nodeRef');
	},
	
	getCommentContentRecordValue : function(record) {
		return record.get('cm:content');
	},
	
	editComment : function(commentNodeRef, content, record) {
		
		var 
			me = this,
			permissions = record.get('permissions')
		;
		
		Ext.create('Yamma.view.comments.PromptDialog', {
			title : 'Ajouter un commentaire',
			operation : Yamma.view.comments.PromptDialog.OPERATION_EDIT,
			nodeRef : commentNodeRef,
			comment : content,
			permissions : permissions,
			listeners : {
				'success' : function() {
					Ext.Function.defer(function() {me.refresh();}, 10);
				}
			}
		}).show();
		
	}
});