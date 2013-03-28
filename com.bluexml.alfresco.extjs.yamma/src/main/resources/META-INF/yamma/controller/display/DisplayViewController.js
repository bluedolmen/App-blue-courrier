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
		'Bluexml.windows.PreviewWindow',
		'Bluexml.view.utils.DownloadFrame',
		'Yamma.store.YammaStoreFactory',
		'Yamma.utils.ReplyUtils'
	],
	
	views : [
		'display.DisplayView',
		'edit.EditDocumentView',
		'edit.EditDocumentForm',
		'comments.CommentsView'
	],

	refs : [
		{
			ref : 'mailsView',
			selector : 'mailsview'
		},
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
			
			'displayview' : {
				update : this.onUpdate,
				tabchange : this.onTabChange,
				tabdblclick : this.onTabDblClick,
				downloadfile : this.onDownloadFile,
				addreply : this.onAddReply,
				updatereply : this.onUpdateReply,
				updatetosignedreply : this.onUpdateToSignedReply,
				removereply : this.onRemoveReply
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

		this.clearDisplay();
		this.updateReplyFiles(newMailRecord);
		this.displayMailPreview(newMailRecord);

		this.callParent(arguments);
		
	},
	
	clearDisplay : function() {
		var 
			displayView = this.getDisplayView()
		;
		displayView.clear();
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
		displayView.addPreviewTab({
			nodeRef : this.mainDocumentNodeRef, 
			mimetype : mimetype,
			tabConfig : {
				title : title,
				context : documentRecord,
				iconCls : Yamma.Constants.DOCUMENT_TYPE_DEFINITIONS[typeShort].iconCls,
				editMetaDataHandler : this.onMainDocumentMetaDataEdited
			}, 
			setActive : true
		});
		
		
	},
	
	/**
	 * Handler called when the main-document metadata are edited (action
	 * performed successfully).
	 * 
	 * @private
	 */
	onMainDocumentMetaDataEdited : function(nodeRef, context) {
		
		var 
			doRefresh = this.application.fireEvent('metaDataEdited', this.mainDocumentNodeRef),
			editDocumentForm = this.getEditDocumentForm(),
			
			displayView = this.getDisplayView(),
			origin = context.get(Yamma.utils.datasources.Documents.MAIL_ORIGIN_QNAME),
			previewFrame = displayView.getPreviewFrame(this.mainDocumentNodeRef)
		;
		
		if (doRefresh) {
			editDocumentForm.refresh();
			if ('manual' === origin) previewFrame.refresh();
		}
		
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
			handler = previewTab.editMetaDataHandler,
			context = previewTab.context
		;
		
		if (!handler) return;		
		handler.call(this, nodeRef, context);
		
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
		
		var 
			context = newCard.context,
			editDocumentView = this.getEditDocumentView()
		;
		
		if (!context) return;		
		editDocumentView.updateContext(context);
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
	
	
	onUpdate : function(updateTarget) {
		
		if ('replies' == updateTarget) {
			this.updateReplyFiles();
		}
		
	},

	updateReplyFiles : function() {
		
		if (!this.mainDocumentNodeRef) return; // there is no document displayed
		
		var 
			me = this,			
			displayView = this.getDisplayView()
		;
		
		Yamma.store.YammaStoreFactory.requestNew({
			
			storeId : 'Replies',
			onStoreCreated : displayReplies, 
			proxyConfig : {
    			extraParams : {
    				'@nodeRef' : this.mainDocumentNodeRef
    			}
    		}
			
		});
		
		function displayReplies(store) {
			
			store.load({
			    scope   : me,
			    callback: function(records, operation, success) {
			    	if (!success) return;
			    	
			    	var replyTabRefs = getReplyTabRefs();
			    	
			    	Ext.Array.forEach(records, function(record) {
			    		
			    		var
			    			nodeRef = record.get('nodeRef'),
			    			mimetype = record.get('mimetype')
			    		;
			    		
			    		var existingTab = displayView.getPreviewTab(nodeRef);
			    		if (existingTab) {
			    			Ext.Array.remove(replyTabRefs, nodeRef);
			    			return; // skip existing replies
			    		}
			    		
			    		displayView.addPreviewTab({
			    			
			    			nodeRef : nodeRef,
			    			mimetype : mimetype,
			    			tabConfig : {
			    				context : record,
			    				title : record.get('cm:title') || record.get('cm:name'),
			    				iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
			    				editMetaDataHandler : me.onReplyFileMetaDataEdited
			    			},
			    			position : 0, // in reverse order => replies are displayed first,
			    			setActive : true // also make the reply visible to the user
			    			
			    		});
			    		
			    	});
			    	
			    	// Remove obsolete tabs
			    	
			    	Ext.Array.forEach(replyTabRefs, function(tabRef) {
			    		displayView.removePreviewTab(tabRef);
			    	});
			    	
			    	updateMainContext(records);
			    }
			});
			
		}
		
		function getReplyTabRefs() {
			
			var 
				tabs = displayView.query('*[context != ""]') || [],
				
				replyTabs = Ext.Array.filter(tabs, function(tab) {					
					var typeShort = tab.context.get('typeShort');
					return Yamma.utils.datasources.Replies.OUTBOUND_MAIL_QNAME == typeShort;
				}),
				
				replyTabRefs = Ext.Array.map(replyTabs, function(tab) {
					return tab.context.get('nodeRef');
				})
 
			;
			
			return replyTabRefs;
		}
		
		function updateMainContext(records) {
			
			if (!me.mainDocumentNodeRef) return;
			
			var
				mainTab = displayView.getPreviewTab(me.mainDocumentNodeRef),
				mainContext = mainTab.context
			;
			
			mainContext.set(Yamma.utils.datasources.Documents.MAIL_HAS_REPLIES_QNAME, records.length > 0);
			
		}
		
	},

	
	onAddReply : function(documentNodeRef, action) {
		
		if (!documentNodeRef) return;
		
		Yamma.utils.ReplyUtils.replyFromItemAction(
			action, 
			documentNodeRef, 
			null, /* updatedReplyNodeRef */
			Ext.bind(this.onReplyOperationSuccess, this) /* onSuccess */
		);
		
	},
	
	onUpdateReply : function(replyNodeRef, context, tab) {
		
		if (!this.mainDocumentNodeRef) return;
		
		var me = this;
		
		Yamma.utils.ReplyUtils.replyFromLocalFile(
			this.mainDocumentNodeRef, /* documentNodeRef */
			replyNodeRef, /* updatedReplyNodeRef */
			function() { /* onSuccess */
				var displayView = me.getDisplayView();
				if (!displayView) return;
				
				displayView.refreshPreviewTab(replyNodeRef);
				me.onReplyOperationSuccess();
			}
		);
		
	},	

	onUpdateToSignedReply : function(replyNodeRef, context, tab) {
		
		if (!this.mainDocumentNodeRef) return;
		
		var me = this;
		
		Yamma.utils.ReplyUtils.replyFromLocalFile(
			this.mainDocumentNodeRef, /* documentNodeRef */
			replyNodeRef, /* updatedReplyNodeRef */
			function() { /* onSuccess */
				var displayView = me.getDisplayView();
				if (!displayView) return;
				
				displayView.refreshPreviewTab(replyNodeRef);
				me.onReplyOperationSuccess();
			},
			[{
				name : 'signed',
				value : 'true'
			}] /* additionalFields */
		);
		
	},		
	
	onReplyOperationSuccess : function() {
		
		var mailsView = this.getMailsView();
		mailsView.refreshSingle(this.mainDocumentNodeRef, 'nodeRef');
		
		this.updateReplyFiles();
		
	},
		
	onRemoveReply : function(replyNodeRef, context, tab) {
		
		Yamma.utils.ReplyUtils.removeReply(
			replyNodeRef,
			Ext.bind(this.onReplyOperationSuccess, this)
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
		
	},
	
	onDownloadFile : function(nodeRef, context, tab) {
		var
			documentName = context.get(Yamma.utils.datasources.Documents.DOCUMENT_NAME_QNAME)
		;
		
		Bluexml.view.utils.DownloadFrame.downloadDocument(nodeRef, documentName);	
	}

	
		
});