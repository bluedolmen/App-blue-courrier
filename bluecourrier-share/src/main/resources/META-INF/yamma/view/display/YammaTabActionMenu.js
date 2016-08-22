Ext.define('Yamma.view.display.YammaTabActionMenu', {
	
	extend : 'Yamma.view.display.TabActionMenu',
	alias : 'plugin.yammatabactionmenu',
	
	requires : [
		'Yamma.utils.datasources.Documents',
		'Yamma.utils.datasources.Replies',
		'Yamma.utils.ReplyUtils'
	],
		
	statics : {
		
		_checkType : function(item, expectedType) {
	    	
	    	var
	    		actualType = item.context.get(Yamma.utils.datasources.Documents.MAIL_KIND_QNAME),
	    		expectedTypes = [].concat(expectedType)
	    	;
	    	
	    	return Ext.Array.contains(expectedTypes, actualType);
	    	
	    }

	},

	constructor : function() {
		
		var me = this;
	
		this.items = [
//			{
//				text : 'Ajouter réponse',
//				iconCls : Yamma.Constants.getIconDefinition('email_go_add').iconCls,
//				isAvailable : this.isAddReplyAvailable,
//				typeFilter : Yamma.utils.datasources.Documents.INBOUND_MAIL_QNAME,
//				menu : Yamma.utils.ReplyUtils.getFileSelectionReplyMenu(
//					function onItemClick(menu, item, e) {
//		    			
//		    			var
//		    				action = item.action,
//		    				activeItem = me.item,
//		    				context = activeItem.context,
//		    				nodeRef = context.get('nodeRef')
//		    			;
//		    			
//		    			me.tabPanel.fireEvent('addreply', nodeRef, action);
//		    			
//		    		}
//		    	)
//
//			},
			{
				text : i18n.t('view.dialog.display.yammatabactionmenu.items.download'),
				iconCls : Yamma.Constants.getIconDefinition('page_white_get').iconCls,
				isAvailable : true,
				handler : getHandler('downloadfile')
			},
			{
				text : i18n.t('view.dialog.display.yammatabactionmenu.items.update'),
				iconCls : Yamma.Constants.getIconDefinition('page_white_put').iconCls,
				isAvailable : this.isUpdateReplyAvailable,
				typeFilter : Yamma.utils.datasources.Documents.OUTGOING_MAIL_KIND,
				handler : getHandler('updatereply')
			},
//			{
//				text : 'Charger version signée',
//				iconCls : Yamma.Constants.getIconDefinition('text_signature_up').iconCls,
//				isAvailable : this.isUpdateToSignedReplyAvailable,
//				typeFilter : Yamma.utils.datasources.Documents.OUTGOING_MAIL_KIND,
//				handler : getHandler('updatetosignedreply')
//			},
			{
				text : i18n.t('view.dialog.display.yammatabactionmenu.items.delete'),
				iconCls : Yamma.Constants.getIconDefinition('delete').iconCls,
				isAvailable : this.isRemoveReplyAvailable,
				typeFilter : Yamma.utils.datasources.Documents.OUTGOING_MAIL_KIND,
				handler : getHandler('removereply')
			}
		];
		
		this.callParent();
		
    	function getHandler(eventName) {
    		
    		return (function(menuitem) {
    			
    			var 
    				activeItem = me.item,
    				context = activeItem.context,
    				nodeRef = context.get('nodeRef')
    			;
    			
    			me.tabPanel.fireEvent(eventName, nodeRef, context, activeItem);
    			
    		});
    		
    	}		
	
	},
	
	isAvailable : function(menuitem) {
		
		if (!menuitem) Ext.Error.raise(i18n.t('view.dialog.display.yammatabactionmenu.errors.menuitem'),);
		
		var typeFilter = menuitem.typeFilter;
		if (typeFilter) {
			if (!Yamma.view.display.YammaTabActionMenu._checkType(this.item, typeFilter)) return false;
		}
		
		return this.callParent(arguments);
		
	},
	
	isAddReplyAvailable : function(item) {
		
		var
			context = item.context,
			canReply = !!context.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_REPLY),
			hasReplies = !!context.get(Yamma.utils.datasources.Documents.MAIL_HAS_REPLIES_QNAME)
		;
		
		return canReply && !hasReplies;
		
	},
	
    isUpdateReplyAvailable : function(item) {
    	
		var
			context = item.context,
			canUpdateReply = !!context.get(Yamma.utils.datasources.Replies.REPLY_CAN_UPDATE)
		;
		
		return canUpdateReply;
		
    },
    
//    isUpdateToSignedReplyAvailable : function(item) {
//    	
//		var
//			context = item.context,
//			canUpdateReply = !!context.get(Yamma.utils.datasources.Replies.REPLY_CAN_UPDATE),
//			canReplyBeSigned = !!context.get(Yamma.utils.datasources.Replies.REPLY_CAN_BE_SIGNED),
//			state = context.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME)
//		;
//		
//		return (canUpdateReply && canReplyBeSigned && 'signing' == state);
//		
//    },
//    
    isRemoveReplyAvailable : function(item) {
    	
		var
			context = item.context,
			canDeleteReply = !!context.get(Yamma.utils.datasources.Replies.REPLY_CAN_DELETE)
		;
		
		return canDeleteReply;
		
    }    
    
	
});