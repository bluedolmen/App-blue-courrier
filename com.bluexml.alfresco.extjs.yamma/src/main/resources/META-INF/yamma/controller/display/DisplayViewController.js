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
			
			'replyfilesbutton #addReply menuitem' : {
				click : this.onAddReply
			},
			
			'replyfilesbutton #removeReply' : {
				click : this.onRemoveReply
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
		this.displayReplyFiles(newMailRecord);

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
		
		var 
			context = newCard.context,
			editDocumentView = this.getEditDocumentView()
		;
		
		this.updateReplyFilesButton(context); // newCard.context may be undefined here...
		
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
	
	
/*
 * The following part of code may be used to build a reply menu in
 * order to choose the reply to display if we need to attach
 * several replies to a same inbound document...
 */	
//	/*
//	 * REPLY MENU (ITEMS)
//	 */
//	
//	/**
//	 * Reply-file menu-item clicked handler.
//	 * 
//	 * This handler displays a new tab with a preview of the clicked reply
//	 * document.
//	 * 
//	 * @private
//	 * @param {Ext.menu.Item}
//	 *            item The selected menu-item
//	 */
//	onReplyFileClick : function(item) {
//		
//		var 
//			displayView = this.getDisplayView(),
//			nodeRef = item.itemId,
//			previewTab = displayView.getPreviewTab(nodeRef)
//		;
//		
//		if (!nodeRef) return;		
//		if (previewTab) {
//			displayView.setActiveTab(previewTab);
//			return;
//		}
//		
//		displayView.addPreviewTab({
//			nodeRef : nodeRef, 
//			mimetype : item.mimetype,
//			tabConfig : {
//				title : item.text,
//				context : item.context,
//				iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
//				editMetaDataHandler : this.onReplyFileMetaDataEdited,
//				closable : true
//			},
//			setActive : true
//		});
//		
//	},

	displayReplyFiles : function() {
		
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
			    	
			    	Ext.Array.forEach(records, function(record) {
			    		
			    		var
			    			nodeRef = record.get('nodeRef'),
			    			mimetype = record.get('mimetype')
			    		;
			    		
			    		var existingTab = displayView.getPreviewTab(nodeRef);
			    		if (existingTab) return; // skip existing replies
			    		
			    		displayView.addPreviewTab({
			    			
			    			nodeRef : nodeRef,
			    			mimetype : mimetype,
			    			tabConfig : {
			    				context : record,
			    				title : record.get('cm:title') || record.get('cm:name'),
			    				iconCls : Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION.iconCls,
			    				editMetaDataHandler : me.onReplyFileMetaDataEdited
			    			}
			    			
			    		});
			    		
			    	});
			    	
			    	updateMainContext(records);
			    }
			});
			
		}
		
		function updateMainContext(records) {
			
			if (!me.mainDocumentNodeRef) return;
			
			var
				mainTab = displayView.getPreviewTab(me.mainDocumentNodeRef),
				mainContext = mainTab.context
			;
			
			mainContext.set(Yamma.utils.datasources.Documents.MAIL_HAS_REPLIES_QNAME, records.length > 0);
			me.updateReplyFilesButton();
			
		}
		
	},

	
	/**
	 * Updates the reply-files button status given the current main-document
	 * context
	 * 
	 * @private
	 */
	updateReplyFilesButton : function(context) {
		
		if (undefined === context) {
			var 
				displayView = this.getDisplayView(),
				activeTab = displayView.getActiveTab()
			;
			if (activeTab) {
				context = activeTab.context;
			}
		}
		
		var replyFilesButton = this.getReplyFilesButton();
		replyFilesButton.updateStatus(context || null);
		
	},	
	
	onAddReply : function(menuItem) {
		
		var
			action = menuItem.action,
			documentNodeRef = this.mainDocumentNodeRef
		;
		if (!documentNodeRef) return;
		
		return this.replyDocument(documentNodeRef, action);
		
	},

	/**
	 * @private
	 * @param documentNodeRef
	 */
	replyDocument : function(documentNodeRef, action) {
		
		var 
			me = this,
			
			uploadUrl = Bluexml.Alfresco.resolveAlfrescoProtocol(
				'alfresco://bluexml/yamma/reply-mail'
			),
			
			mailsView = this.getMailsView()
		;
		
		if ('uploadFile' == action) {
			showUploadWindow();
		} else if ('selectFile' == action) {
			showSelectFileWindow();
		}

		function showUploadWindow() {
	
			Ext.create('Yamma.view.windows.UploadFormWindow', {
				
				title : 'Choisissez un fichier en <b>réponse</b>',
				
				formConfig : {
					uploadUrl : uploadUrl + '?format=html', // force html response format due to ExtJS form submission restriction 
					additionalFields : [{
						name : 'nodeRef',
						value : documentNodeRef
					}]
				},
				
				onSuccess : onSuccess
				
			}).show();

			
		};
		
		
		function showSelectFileWindow() {
			
			var
				selectFileWindow = Ext.create('Yamma.view.windows.SelectCMSFileWindow')
			;
			

			selectFileWindow.mon(selectFileWindow, 'fileselected', function(nodeRef, record) {
								
				var
					operation = selectFileWindow.getOperation(),
					fileName = selectFileWindow.getFileName()
				;				
				
				selectFileWindow.setLoading(true);
				
				Bluexml.Alfresco.jsonPost(
					{
						url : uploadUrl,
						dataObj : {
							nodeRef : documentNodeRef,
							modelRef : nodeRef,
							operation : operation,
							filename : fileName
						},
						
						onSuccess : function() {
							onSuccess();
							selectFileWindow.close();
						},
						
						onFailure : function() {
							selectFileWindow.close();
						}
					}
				);	
	
				return false; // do not close the window yet
			});
	
			selectFileWindow.show();
			
		}
		
		function onSuccess() {
			me.displayReplyFiles();
			mailsView.refreshSingle(me.mainDocumentNodeRef, 'nodeRef');			
		}
		
	},
	
	
	
	onRemoveReply : function(menuItem) {
		
		var 
			displayView = this.getDisplayView(),
			currentTab =  displayView.getActiveTab(),
			context = null,
			replyNodeRef = null
		;
		
		if (!currentTab) return;
		
		context = currentTab.context;
		if (!context) return;
		
		replyNodeRef = context.get('nodeRef');
		this.removeReply(replyNodeRef);
		
	},
	
	removeReply : function(replyNodeRef) {
		
		if (!replyNodeRef) return;
		
		var 
			me = this,
			displayView = this.getDisplayView(),
			currentTab =  displayView.getActiveTab(),
			mailsView = this.getMailsView()
		;
		
		Bluexml.windows.ConfirmDialog.INSTANCE.askConfirmation(
			'Supprimer la réponse ?', /* title */
			'êtes-vous certain de vouloir supprimer la réponse ?', /* message */
			deleteReply /* onConfirmation */
		);
		
		function deleteReply() {
			
			var
				url = Bluexml.Alfresco.resolveAlfrescoProtocol(
					'alfresco://bluexml/yamma/reply-mail/' + replyNodeRef.replace(/:\//,'')
				)
			;
			
			Bluexml.Alfresco.jsonRequest(
				{
					method : 'DELETE',
					url : url,
					onSuccess : function() {
						displayView.remove(currentTab);
						mailsView.refreshSingle(me.mainDocumentNodeRef, 'nodeRef');
						me.displayReplyFiles(); // update main-document context as a side effect
					}
				}
			);	
			
		}
		
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