Ext.define('Yamma.view.display.ReplyFilesButton', {

	extend : 'Ext.button.Button',
	alias : 'widget.replyfilesbutton',
	
	iconCls: Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
	
	menu : {
		
		items : [
	         {
	        	 text : i18n.t('view.dialog.display.replyfilesbutton.items.addReply'), //'Ajouter une réponse',
	        	 itemId : 'addReply',
	        	 iconCls : 'icon-add',
	        	 menu : [
					{
						text :  i18n.t('view.dialog.display.replyfilesbutton.items.uploadFile'),
						iconCls : Yamma.Constants.getIconDefinition('page_add').iconCls,
						action : 'uploadFile'
					},
					{
						text :  i18n.t('view.dialog.display.replyfilesbutton.items.selectFile'),
						iconCls : Yamma.Constants.getIconDefinition('database_add').iconCls,
						action : 'selectFile'
					}
	        	 ]
	         },
	         {
	        	 text :  i18n.t('view.dialog.display.replyfilesbutton.items.removeReply'),
	        	 itemId : 'removeReply',
	        	 iconCls : 'icon-delete'
	         }
		]
	},
	
	/**
	 * Update the status of the button menu.
	 * 
	 * @param {Object}
	 *            context
	 */
	updateStatus : function(context) {
		
		if (!context) {
			this.disable();
			return;
		}

		var kind = tab.context.get(Yamma.utils.datasources.Documents.MAIL_KIND_QNAME);		
		
		if (Yamma.utils.datasources.Documents.INCOMING_MAIL_KIND == kind) {
			this.updateMenuForMainDocument(context);
		}
		else if (Yamma.utils.datasources.Documents.OUTGOING_MAIL_KIND == kind) {
			this.updateMenuForReply(context);			
		}		
		
	},
	
	updateMenuForMainDocument : function(context) {
		

		var
			canReply = !!context.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_REPLY),
			hasReplies = !!context.get(Yamma.utils.datasources.Documents.MAIL_HAS_REPLIES_QNAME),
			addReplyMenuItem = this.menu.down('#addReply'),
			removeReplyMenuItem = this.menu.down('#removeReply')
		;
		
		removeReplyMenuItem.disable();
		addReplyMenuItem.setDisabled(!canReply || hasReplies);
		
		this.postProcessReplyMenu();
		
	},
	
	updateMenuForReply : function(context) {
		
		var
			canDelete = !!context.get('canDelete'),
			addReplyMenuItem = this.menu.down('#addReply'),
			removeReplyMenuItem = this.menu.down('#removeReply')
		;
		
		addReplyMenuItem.disable();
		removeReplyMenuItem.setDisabled(!canDelete);
		
		this.postProcessReplyMenu();
	},
	
	postProcessReplyMenu : function() {
		
		var inactive = true;
		Ext.Array.forEach(this.menu.query('menuitem'), function(item) {
			inactive &= item.isDisabled();
		});
				
		this.setDisabled(inactive);
		
	}
	
});