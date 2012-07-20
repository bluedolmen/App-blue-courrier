Ext.define('Yamma.controller.DisplayViewController',{
	
	extend : 'Yamma.controller.MailSelectionAwareController',
	
	uses : [
		'Yamma.store.YammaStoreFactory'
	],

	refs : [
	    {
	    	ref : 'displayView',
	    	selector : 'displayview'
	    },
	    
	    {
			ref : 'editDocumentView',
	    	selector : 'editdocumentview'
	    },	    
	    
	    {
	    	ref : 'replyFilesButton',
	    	selector : '#replyFilesButton'
	    },
	    
	    {
	    	ref : 'attachedFilesButton',
	    	selector : '#attachedFilesButton'
	    }
	],
	
	init: function() {
		
		this.control({
			'#replyFilesButton menuitem' : {
				click : this.onReplyFileClick
			},
			
			'displayview' : {
				tabchange : this.onTabChange
			},
			
			'editdocumentview': {
				successfulEdit : this.onSuccessfulFormEdit
			}
		});

		this.callParent(arguments);
		
	},
	

	/*
	 * NEW MAIL SELECTED LOGIC
	 */
	
	onNewMailSelected : function(newMailRecord) {
				
		this.displayMailPreview(newMailRecord);
		this.callParent(arguments);
		
	},
	
	displayMailPreview : function(documentRecord) {
		
		if (!documentRecord) return;
		var displayView = this.getDisplayView();
		if (!displayView) return;
		
		// Mandatory parameters
		var nodeRef = documentRecord.get('nodeRef');
		if (!nodeRef) return;
		
		var typeShort = documentRecord.get('typeShort');
		if (!typeShort) return;
		
		// Optional ones
		var mimetype = documentRecord.get('mimetype');
		var title = documentRecord.get('cm:title') || documentRecord.get('cm:name') || 'preview';		
		
		
		// New document includes clearing of the tabs
		displayView.clear();
		displayView.addPreviewTab(
			nodeRef, 
			mimetype /* mimetype */,
			{
				title : title,
				context : documentRecord,
				editMetaDataHandler : this.onMainDocumentMetaDataEdited
			}, /* tabConfig */ 
			true /* setActive */
		);
		
		this.enableReplyFilesButton(nodeRef);
		
	},
	
	onMainDocumentMetaDataEdited : function(nodeRef) {
		
		this.application.fireEvent('metaDataEdited', nodeRef);
		
	},
	
	enableReplyFilesButton : function(documentNodeRef) {
		
		// The button is enabled only if reply files exist.
		this.buildReplyFilesMenu(documentNodeRef);
		
	},
	
	
	/*
	 * SUCCESSFUL EDIT FORM
	 */
	onSuccessfulFormEdit : function(formPanel, nodeRef) {
		
		var displayView = this.getDisplayView();
		if (!displayView) return;
		
		var previewTab = displayView.getPreviewTab(nodeRef);
		if (!previewTab) return;
		
		var handler = previewTab.editMetaDataHandler;
		if (!handler) return;
		
		handler.call(this, nodeRef);
		
	},
	
	
	/*
	 * CLEAR SELECTED MAIL LOGIC
	 */
	
	onClearSelectedMail : function() {
		var displayView = this.getDisplayView();
		if (displayView) displayView.clear();
		
		var editDocumentView = this.getEditDocumentView();
		if (editDocumentView) editDocumentView.clear();		
		
		this.disableReplyFilesButton();
		
		this.callParent(arguments);		
	},
	
	disableReplyFilesButton : function() {
		var replyFilesButton = this.getReplyFilesButton();
		if (!replyFilesButton) return;
		
		if (replyFilesButton.isDisabled()) return; 
		replyFilesButton.disable();
		
		if (replyFilesButton.menu) Ext.destroy(replyFilesButton.menu);		
	},
	
	
	
	/*
	 * TAB CHANGE
	 */
	onTabChange : function(displayView, newCard, oldCard) {
		
		if (!newCard.context) return;
		
		var nodeRef = newCard.context.get('nodeRef');
		var typeShort = newCard.context.get('typeShort');
		
		this.displayEditForm(nodeRef, typeShort);
	},
	
	getPreviewFrame : function(previewTab) {
		
		if (!previewTab) return null;
		
		var previewFrame = previewTab.child('previewframe');
		if (!previewFrame) return null;
		
		return previewFrame.getNodeRef();
		
	},	
	
	displayEditForm : function(nodeRef, typeShort) {
		
		var editDocumentView = this.getEditDocumentView();
		if (!editDocumentView) return;		
		if (!nodeRef) return;
		
		editDocumentView.displayEditForm(nodeRef, typeShort);	    	
		
	},	
	
	
	
	/*
	 * REPLY MENU (ITEMS)
	 */
	
	onReplyFileClick : function(item) {
		
		var displayView = this.getDisplayView();
		if (!displayView) return;
		
		var nodeRef = item.itemId;
		if (!nodeRef) return;
		
		var previewTab = displayView.getPreviewTab(nodeRef);
		if (previewTab) {
			displayView.setActiveTab(previewTab);
			return;
		}
		
		displayView.addPreviewTab(
			nodeRef, 
			item.mimetype /* mimetype */,
			{
				title : item.text,
				context : item.context,
				editMetaDataHandler : this.onReplyFileMetaDataEdited
			}, /* tabConfig */
			true /* setActive */
		);
		
	},
	
	onReplyFileMetaDataEdited : function(nodeRef) {
		
		// refresh the edit-form
		var editDocumentView = this.getEditDocumentView();
		if (!editDocumentView) return;		
		
		editDocumentView.refresh();
		
	},
	
	buildReplyFilesMenu : function(documentNodeRef) {
		
		Yamma.store.YammaStoreFactory.requestNew({
		
			storeId : 'Replies',
			onStoreCreated : Ext.bind(this.createReplyFilesMenu, this), 
			proxyConfig : {
    			extraParams : {
    				'@nodeRef' : documentNodeRef
    			}
    		}
			
		});
		
	},
	
	createReplyFilesMenu : function(store) {
		
		var me = this;
		
		store.load({
		    scope   : this,
		    callback: function(records, operation, success) {
		    	if (!success) return;
		    	
		    	var menu = buildMenu(records);
		    	var replyFilesButton = me.getReplyFilesButton();
		    	
		    	if (menu) {
		    		var replyNumber = menu.items.length;
		    		var tooltipText = replyNumber + ' fichier(s) en réponse';
		    		
		    		replyFilesButton.menu = menu;
		    		replyFilesButton.setTooltip(tooltipText);
		    		replyFilesButton.enable();
		    	} else {
		    		replyFilesButton.disable();
		    	}
		    	
		    	
		    }
		});
		
		function buildMenu(records) {
			
			if (!Ext.isArray(records)) return null;
		
			var menuItems = Ext.Array.map(records, function(record) {
				var mimetype = record.get('mimetype');
				var iconDefinition = Yamma.Constants.getMimeTypeIconDefinition(mimetype) || {};
				
				return {
					itemId : record.get('nodeRef'),
					text : record.get('cm:title') || record.get('cm:name'),
					iconCls : iconDefinition.iconCls,
					mimetype : mimetype,
					context : record
				};
			});
			
			if (0 == menuItems.length) return null;
			
			return Ext.create('Ext.menu.Menu', {
			    items: menuItems
			});
			
		}
	}
		
});