Ext.define('Yamma.controller.display.DisplayViewController',{
	
	extend : 'Yamma.controller.MailSelectionAwareController',
	
	uses : [
		'Yamma.store.YammaStoreFactory',
		'Bluexml.windows.PreviewWindow'
	],
	
	views : [
		'display.DisplayView',
		'display.ReplyFilesButton',
		'edit.EditDocumentView',
		'edit.EditDocumentForm',
		'comments.CommentsView'
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
			ref : 'editDocumentForm',
	    	selector : 'editdocumentform'
	    },
	    
	    {
	    	ref : 'commentsView',
	    	selector : 'commentsview'
	    },
	    
	    {
	    	ref : 'replyFilesButton',
	    	selector : 'replyfilesbutton'
	    },
	    
	    {
	    	ref : 'attachedFilesButton',
	    	selector : '#attachedFilesButton'
	    }
	    
	],
	
	/**
	 * Stores the main-document nodeRef. The main-document is the one selected
	 * in the mails-view.
	 * 
	 * @private
	 * @type String
	 */
	mainDocumentNodeRef : null,
	
	init: function() {
		
		this.control({
			
			'replyfilesbutton menuitem' : {
				click : this.onReplyFileClick
			},
			
			'displayview' : {
				tabchange : this.onTabChange,
				tabdblclick : this.onTabDblClick
			},
			
			'editdocumentform': {
				successfulEdit : this.onSuccessfulFormEdit
			}			
			
		});

		this.callParent(arguments);
		
	},
	

	/*
	 * NEW MAIL SELECTED LOGIC
	 */
	
	onNewMailSelected : function(newMailRecord) {
		
		if (!newMailRecord) return;
		
		var nodeRef = newMailRecord.get('nodeRef'); // mandatory
		if (!nodeRef) return;
		
		this.mainDocumentNodeRef = nodeRef;
		this.displayMailPreview(newMailRecord);
		this.updateReplyFilesButton();

		this.callParent(arguments);
		
	},
	
	displayMailPreview : function(documentRecord) {
		
		var 
			displayView = this.getDisplayView();
			typeShort = documentRecord.get('typeShort'), // mandatory
			mimetype = documentRecord.get('mimetype'),
			title = documentRecord.get('cm:title') || documentRecord.get('cm:name') || 'preview'
		;
			
		if (!typeShort) return;
		
		// New document includes clearing of the tabs
		displayView.clear();
		displayView.addPreviewTab(
			this.mainDocumentNodeRef, 
			mimetype /* mimetype */,
			{
				title : title,
				context : documentRecord,
				editMetaDataHandler : this.onMainDocumentMetaDataEdited
			}, /* tabConfig */ 
			true /* setActive */
		);
		
		
	},
	
	onMainDocumentMetaDataEdited : function() {
		
		var 
			doRefresh = this.application.fireEvent('metaDataEdited', this.mainDocumentNodeRef),
			editDocumentForm = this.getEditDocumentForm();
		
		if (doRefresh) {
			editDocumentForm.refresh();
		}
		
	},
	
	updateReplyFilesButton : function() {
		
		var replyFilesButton = this.getReplyFilesButton();
		replyFilesButton.updateStatus(this.mainDocumentNodeRef || null);
		
	},
	
	
	/*
	 * SUCCESSFUL EDIT FORM
	 */
	onSuccessfulFormEdit : function(formPanel, nodeRef) {
		
		var 
			displayView = this.getDisplayView(),
			previewTab = displayView.getPreviewTab(nodeRef),
			handler = previewTab.editMetaDataHandler
		;
		
		if (!handler) return;		
		handler.call(this, nodeRef);
		
	},
	
	
	/*
	 * CLEAR SELECTED MAIL LOGIC
	 */
	
	onClearSelectedMail : function() {
		var 
			displayView = this.getDisplayView(),
			editDocumentView = this.getEditDocumentView()
		;
			
		displayView.clear();
		this.mainDocumentNodeRef = null;
		editDocumentView.clear();
		this.updateReplyFilesButton();
		
		this.callParent(arguments);		
	},	
	
	
	/*
	 * TAB CHANGE
	 */
	onTabChange : function(displayView, newCard, oldCard) {
		
		if (!newCard.context) return;
		
		var 
			nodeRef = newCard.context.get('nodeRef'),
			typeShort = newCard.context.get('typeShort')
		;
		
		this.updateEditView(nodeRef, typeShort);
	},
	
	getPreviewFrame : function(previewTab) {
		
		if (!previewTab) return null;
		
		var previewFrame = previewTab.child('previewframe');
		if (!previewFrame) return null;
		
		return previewFrame.getNodeRef();
		
	},	
	
	updateEditView : function(nodeRef, typeShort) {
		
		if (!nodeRef) return;
		
		var editDocumentView = this.getEditDocumentView();
		editDocumentView.updateContext(nodeRef, typeShort);	    	
		
	},	
	
	/**
	 * When double-clicking on a preview tab, we display a maximized window of
	 * the content.
	 * 
	 * Should we display another navigator window in order to enable the user to
	 * work with a dual screen more easily?
	 * 
	 * @private
	 * @param {Ext.tab.Panel}
	 *            container
	 * @param {Ext.tab.Tab}
	 *            tab
	 */
	onTabDblClick : function(container, tab) {
		
		var tabContentPanel = tab.card;
		if (!tabContentPanel) return;
		
		var previewFrame = tabContentPanel.child('previewframe');
		if (!previewFrame) return;
		
		var 
			nodeRef = previewFrame.nodeRef,
			mimeType = previewFrame.mimeType,
			title = tabContentPanel.title
		;
		
		Ext.create('Bluexml.windows.PreviewWindow', {
			title : title,
			nodeRef : nodeRef,
			mimeType : mimeType
		}).maximize().show();
		
	},
	
	
	
	/*
	 * REPLY MENU (ITEMS)
	 */
	
	onReplyFileClick : function(item) {
		
		var 
			displayView = this.getDisplayView(),
			nodeRef = item.itemId,
			previewTab = displayView.getPreviewTab(nodeRef)
		;
		
		if (!nodeRef) return;		
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
		var editDocumentForm = this.getEditDocumentForm();		
		editDocumentForm.refresh();
		
	}
	
		
});