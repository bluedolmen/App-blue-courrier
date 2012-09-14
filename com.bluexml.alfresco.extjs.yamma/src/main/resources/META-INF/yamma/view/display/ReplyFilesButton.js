Ext.define('Yamma.view.display.ReplyFilesButton', {

	extend : 'Ext.button.Button',
	alias : 'widget.replyfilesbutton',
	
	iconCls: Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
	
	menu : {
		
		items : [
	         {
	        	 text : 'Ajouter une réponse',
	        	 itemId : 'addReply',
	        	 iconCls : 'icon-add'
	         },
	         {
	        	 text : 'Supprimer la réponse',
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

		var
			typeShort = context.get('typeShort')
		;
		
		switch(typeShort) {
		
		case 'yamma-ee:InboundMail':
			this.updateMenuForMainDocument(context);
			break;
			
		case 'yamma-ee:Reply':
			this.updateMenuForReply(context);
			break;
		
		}
		
	},
	
	updateMenuForMainDocument : function(context) {
		

		var
			canReply = !!context.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_REPLY),
			hasReplies = !!context.get(Yamma.utils.datasources.Documents.DOCUMENT_HAS_REPLIES_QNAME),
			addReplyMenuItem = this.menu.down('#addReply'),
			removeReplyMenuItem = this.menu.down('#removeReply')
		;
		
		removeReplyMenuItem.disable();
		if (canReply && !hasReplies) {
			addReplyMenuItem.enable();
		} else {
			addReplyMenuItem.disable();
		}
		
		this.postProcessReplyMenu();
		
	},
	
	updateMenuForReply : function(context) {
		
		var
			canDelete = !!context.get('canDelete'),
			addReplyMenuItem = this.menu.down('#addReply'),
			removeReplyMenuItem = this.menu.down('#removeReply')
		;
		
		addReplyMenuItem.disable();
		if (canDelete) {
			removeReplyMenuItem.enable();
		} else {
			removeReplyMenuItem.disable();
		}
		
		this.postProcessReplyMenu();
	},
	
	postProcessReplyMenu : function() {
		
		var inactive = true;
		Ext.Array.forEach(this.menu.query('menuitem'), function(item) {
			inactive &= item.isDisabled();
		});
		
		if (inactive) {
			this.disable();
		} else {
			this.enable();
		}
		
	}
	
});