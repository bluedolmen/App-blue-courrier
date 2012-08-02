Ext.define('Yamma.controller.display.DisplayViewController',{
	
	extend : 'Yamma.controller.MailSelectionAwareController',
	
	uses : [
		'Yamma.store.YammaStoreFactory',
		'Bluexml.windows.PreviewWindow'
	],
	
	views : [
		'display.DisplayView',
		'display.ReplyFilesButton',
		'EditDocumentView'
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
	    	selector : 'replyfilesbutton'
	    },
	    
	    {
	    	ref : 'attachedFilesButton',
	    	selector : '#attachedFilesButton'
	    }
	    
	],
	
	init: function() {
		
		this.control({
			
			'replyfilesbutton menuitem' : {
				click : this.onReplyFileClick
			},
			
			'displayview' : {
				tabchange : this.onTabChange,
				tabdblclick : this.onTabDblClick
			},
			
			'editdocumentview': {
				successfulEdit : this.onSuccessfulFormEdit
			},
			
			'#showCommentsButton': {
				click : this.onShowCommentsButtonClicked
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
		
		this.displayMailPreview(nodeRef, newMailRecord);
		this.updateReplyFilesButton(nodeRef);

		this.callParent(arguments);
		
	},
	
	displayMailPreview : function(nodeRef, documentRecord) {
		
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
			nodeRef, 
			mimetype /* mimetype */,
			{
				title : title,
				context : documentRecord,
				editMetaDataHandler : this.onMainDocumentMetaDataEdited
			}, /* tabConfig */ 
			true /* setActive */
		);
		
		
	},
	
	onMainDocumentMetaDataEdited : function(nodeRef) {
		
		this.application.fireEvent('metaDataEdited', nodeRef);
		
	},
	
	updateReplyFilesButton : function(documentNodeRef) {
		
		var replyFilesButton = this.getReplyFilesButton();
		replyFilesButton.updateStatus(documentNodeRef || null);
		
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
		
		this.displayEditForm(nodeRef, typeShort);
	},
	
	getPreviewFrame : function(previewTab) {
		
		if (!previewTab) return null;
		
		var previewFrame = previewTab.child('previewframe');
		if (!previewFrame) return null;
		
		return previewFrame.getNodeRef();
		
	},	
	
	displayEditForm : function(nodeRef, typeShort) {
		
		if (!nodeRef) return;
		
		var editDocumentView = this.getEditDocumentView();
		editDocumentView.displayEditForm(nodeRef, typeShort);	    	
		
	},	
	
	onTabDblClick : function(container, tab) {
		
		var tabPanel = tab.card;
		if (!tabPanel) return;
		
		var previewFrame = tabPanel.child('previewframe');
		if (!previewFrame) return;
		
		var nodeRef = previewFrame.nodeRef;
		var mimeType = previewFrame.mimeType;
		
		var previewWindow = Ext.create('Bluexml.windows.PreviewWindow', {
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
			previewTab = displayView.getPreviewTab(nodeRef);
		
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
		var editDocumentView = this.getEditDocumentView();		
		editDocumentView.refresh();
		
	},
	
	onShowCommentsButtonClicked : function() {
		
	}
		
});