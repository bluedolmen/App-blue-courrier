Ext.define('Yamma.view.comments.CommentsView', {
	
	// TODO: This view should be refactored using a store depending on the Alfresco comment API!
	
	extend : 'Yamma.utils.grid.StoreGridPanel',
	alias : 'widget.commentsview',
	
	requires : [
		'Ext.grid.column.Template'
	],
	
	uses : [
	    'Yamma.view.comments.PromptDialog'
	],
	
	mixins : {
		editcommentaction : 'Yamma.view.comments.EditCommentAction',
		deletecommentaction : 'Yamma.view.comments.DeleteCommentAction',
		deferredloading : 'Yamma.view.edit.NodeRefDeferredLoading',
		countingtitle : 'Yamma.utils.grid.CountingTitle'
	},
	
	title : 'Commentaires',
	iconCls : Yamma.utils.Constants.getIconDefinition('comments').iconCls,
	
	storeId : 'Comments',
	hasPaging : false,
	hideHeaders : true,
	cls : 'comments',
	
    getDockedItemDefinitions : function() {
    	
    	return [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    border : '1 0 0 0',
		    items: [
	    		'->',
	    		{
	    			xtype : 'button',
	    			itemId : 'addComment-button',
	    			iconCls : 'icon-comment_add',
	    			tooltip : 'Ajouter un commentaire',
	    			disabled : true,
	    			handler : this.onAddComment,
	    			scope : this
	    		}
		    ]
		}];
    	
    },
	
    initComponent : function() {
    	
    	var me = this;
    	
    	function onStoreLoaded(store, records, sucessful) {
    		
    		var
    			addCommentButton = me.queryById('addComment-button'),
    			hasAddChildrenPermission = true === (me.getPermissions()['AddChildren'])
    		;
    		
    		if (null != addCommentButton) {
    			addCommentButton.setDisabled(!hasAddChildrenPermission);
    		}
    		
    	}
    	
    	function onStoreCleared() {
    		
    		var
				addCommentButton = me.queryById('addComment-button'),
				hasAddChildrenPermission = true === (me.getPermissions()['AddChildren'])
			;
			
			if (null != addCommentButton) {
				addCommentButton.setDisabled(true);
			}
			
    	}
    	
		this.on('storeloaded', onStoreLoaded, this);
		this.on('storecleared', onStoreCleared, this);
    	
    	this.mixins.countingtitle.init.call(this);
    	this.callParent(arguments);
    	
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
	 				if (!value) return Bluedolmen.model.Person.NO_USER_AVATAR_URL;
	 				return Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://' + value);
	 			}
	 		},
	 		{
	 			name : 'isModified',
	 			mapping : 'cm:modifed',
	 			convert : function(value, record) {
	 				var
	 					created = record.get('cm:created'),
	 					modified = record.get('cm:modified')
	 				;
	 				
	 				return (modified - created) > 5000;
	 			}
	 		},
	 		{
	 			name : 'isRestricted',
	 			mapping : 'permissions',
	 			type : 'boolean',
	 			convert : function(permissions, record) {
	 				
	 				if (!permissions) return false;
	 				return false === permissions.inherits;
	 				
	 			}
	 		},
	 		{
	 			name : 'restrictedTo',
	 			mapping : 'permissions',
	 			convert : function(permissions, record) {
	 				
	 				if (!permissions || !record.get('isRestricted')) return [];
	 				if (Ext.isEmpty(permissions['private-authorities'])) return ['Moi'];
	 				
	 				return Ext.Array.map(permissions['private-authorities'], function(authority) {
	 					return authority.authorityDisplayName;
	 				});
	 				
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
			'<div>',
			'<span class="created">Publié le {created:date("d/m/Y")}</span>' + 
			'<tpl if="isModified"><span class="modified"> (modifié le {modified:date("d/m/Y")})</span></tpl>' +
			'</div>',
			'<tpl if="isRestricted">',
				'<div class="restricted">{restrictedTo}</div>',
			'</tpl>',
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
				xtype : 'alfrescoactioncolumn',
				maxWidth : 60,
				items : [
					this.getEditCommentActionDefinition(),
					this.getDeleteCommentActionDefinition()
				]
				
			}
		);
		
	},
	
	/**
	 * Add-Button click-handler.
	 * 
	 * @private
	 */
	onAddComment : function() {
		
		var me = this;
		
		Ext.create('Yamma.view.comments.PromptDialog', {
			title : 'Ajouter un commentaire',
			operation : Yamma.view.comments.PromptDialog.OPERATION_ADD,
			nodeRef : me.getDocumentNodeRef(),
			listeners : {
				'success' : function() {
					Ext.Function.defer(function() {me.refresh();}, 10);
				}
			}
		}).show();
		
	}	

});