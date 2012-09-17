Ext.define('Yamma.view.comments.CommentsView', {
	
	extend : 'Yamma.utils.grid.YammaStoreList',
	alias : 'widget.commentsview',
	
	requires : [
		'Ext.grid.column.Template'
	],
	
	mixins : {
		editcommentaction : 'Yamma.view.comments.EditCommentAction',
		deletecommentaction : 'Yamma.view.comments.DeleteCommentAction'
	},
	
	title : 'Commentaires',
	iconCls : 'icon-comments',
	
	storeId : 'Comments',
	hasPaging : false,
	hideHeaders : true,
	cls : 'comments',
	
	config : {
		documentNodeRef : null
	},
	
    getDockedItemDefinitions : function() {
    	return [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    border : '1 0 0 0',
		    items: [
	    		'->',
	    		{
	    			xtype : 'button',
	    			itemId : 'addComment',
	    			iconCls : 'icon-comment_add',
	    			tooltip : 'Ajouter un commentaire'
	    		}
		    ]
		}];    	
    },
		
	loadComments : function(nodeRef) {
		
		if (!nodeRef || !Ext.isString(nodeRef)) {
			Ext.Error.raise('IllegalArgumentException! The provided document nodeRef is not valid');
		}
		
		this.setDocumentNodeRef(nodeRef);
		
		this.load({
			filters : [
				{
					property : 'nodeRef',
					value : nodeRef
				}
			]
		});
		
	},
	
 	getDerivedFields : function() {
 		
 		/*
		 * Here we map to names that do not contains ':' since this character
		 * has a special meaning in tpl processing
		 */
 		return [
 		
	 		{ name : 'content', mapping : 'cm:content' },
	 		{ name : 'created', mapping : 'cm:created' },
	 		{ name : 'modified', mapping : 'cm:modified' },
	 		{ 
	 			name : 'avatarUrl', 
	 			mapping : 'avatar' , 
	 			convert : function(value, record) {
	 				if (!value) return Bluexml.model.Person.NO_USER_AVATAR_URL;
	 				return Bluexml.Alfresco.resolveAlfrescoProtocol('alfresco://' + value);
	 			}
	 		},
	 		{
	 			name : 'isModified',
	 			mappting : 'cm:modifed',
	 			convert : function(value, record) {
	 				var
	 					created = record.get('cm:created'),
	 					modified = record.get('cm:modified')
	 				;
	 				
	 				return (modified - created) > 5000;
	 			}
	 		}
 		
 		];
 		
 	},	
	
	getColumns : function() {
		
		return [
		
			this.getAuthorColumnDefinition(),
			this.getCommentColumnDefinition(),
			this.getActionsColumnDefinition()
		
		];		
	},	
	
	getAuthorColumnDefinition : function() {
		
		var coldef = {
			
			xtype : 'templatecolumn',
			width : 80,
			text : 'Auteur',
			tpl : new Ext.XTemplate(
				'<div class="avatar"><img src="{avatarUrl}" width="64" ></img></div>'
			)
		};
		
		return coldef;
		
	},
	
	COMMENT_TEMPLATE : new Ext.XTemplate(
		'<div class="author">{author}</div>',
		'<div class="content">{content}</div>',
		'<div class="published">' +
			'<span class="created">Publié le {created:date("d/m/Y")}</span>' + 
			'<tpl if="isModified"><span class="modified"> (modifié le {modified:date("d/m/Y")})</span></tpl>' + 
		'</div>'
	), 
	
	getCommentColumnDefinition : function() {
		
		return {	
			xtype : 'templatecolumn',
			flex : 1,
			text : 'Commentaire',
			tpl : this.COMMENT_TEMPLATE 
		};
		
	},
	
	getActionsColumnDefinition : function() {
		
		return this.applyDefaultColumnDefinition (
		
			{
				xtype : 'bluexmlactioncolumn',
				maxWidth : 60,
				items : [
					this.getEditCommentActionDefinition(),
					this.getDeleteCommentActionDefinition()
				]
				
			}
		);
		
	}
	

});