/**
 * The Display View Controller.
 * 
 * This is a major controller which is used to orchestrate the behaviour of the
 * displayed preview documents and the viewing/editing of the various features
 * associated.
 */
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
	
	/**
	 * New Mail selected hander.
	 * 
	 * @private
	 * @param {Ext.data.Model}
	 *            newMailRecord The MailsView record selected in the mails-list
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
	
	/**
	 * Display a mail preview given the selected mails-view record.
	 * 
	 * @private
	 * @param {Ext.data.Model}
	 *            documentRecord the MailsView record
	 */
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
	
	/**
	 * Handler called when the main-document metadata are edited (action
	 * performed successfully).
	 * 
	 * @private
	 */
	onMainDocumentMetaDataEdited : function() {
		
		var 
			doRefresh = this.application.fireEvent('metaDataEdited', this.mainDocumentNodeRef),
			editDocumentForm = this.getEditDocumentForm()
		;
		
		if (doRefresh) {
			editDocumentForm.refresh();
		}
		
	},
	
	/**
	 * Updates the reply-files button status given the current main-document
	 * context
	 * 
	 * @private
	 */
	updateReplyFilesButton : function() {
		
		var replyFilesButton = this.getReplyFilesButton();
		replyFilesButton.updateStatus(this.mainDocumentNodeRef || null);
		
	},
	
	
	/*
	 * SUCCESSFUL EDIT FORM
	 */
	
	/**
	 * Handler of the successfully edited form.
	 * 
	 * @private
	 * @param {Bluexml.view.forms.panel.EditFormPanel}
	 *            formPanel The causing-event form panel.
	 * @param {String}
	 *            nodeRef The nodeRef of the metadata-edited document (as a
	 *            nodeRef)
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
	
	/**
	 * Handler of the clear selected mail.
	 * 
	 * This handler removes the currently displayed document information.
	 * 
	 * @private
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
	/**
	 * Tab-change Handler.
	 * 
	 * @private
	 * @param {Yamma.view.display.DisplayView} displayView
	 * @param {Ext.layout.container.Card} newCard the new card
	 * @param {Ext.layout.container.Card} oldCard the old card
	 */
	onTabChange : function(displayView, newCard, oldCard) {
		
		if (!newCard.context) return;
		
		var 
			nodeRef = newCard.context.get('nodeRef'),
			typeShort = newCard.context.get('typeShort')
		;
		
		this.updateEditView(nodeRef, typeShort);
	},
	
	/**
	 * Update the edit view display.
	 * 
	 * @private
	 * @param {String}
	 *            nodeRef The mandatory nodeRef to the displayed edit form
	 * @param {String}
	 *            typeShort The optional type as an Alfresco Short Name
	 */
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
	
	/**
	 * Reply-file menu-item clicked handler.
	 * 
	 * This handler displays a new tab with a preview of the clicked reply
	 * document.
	 * 
	 * @private
	 * @param {Ext.menu.Item}
	 *            item The selected menu-item
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
	
	/**
	 * Reply-file metadata-edited handler.
	 * 
	 * This handler only refreshes the current form.
	 * 
	 * @private
	 * @param {String}
	 *            nodeRef The Alfresco document nodeRef
	 */
	onReplyFileMetaDataEdited : function(nodeRef) {
		
		// refresh the edit-form
		var editDocumentForm = this.getEditDocumentForm();		
		editDocumentForm.refresh();
		
	}
	
		
});