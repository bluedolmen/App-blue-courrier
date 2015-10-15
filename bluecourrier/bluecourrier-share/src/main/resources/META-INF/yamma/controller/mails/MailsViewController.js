Ext.define('Yamma.controller.mails.MailsViewController', {
	
	extend : 'Ext.app.Controller',
	
	views : [
  		'mails.ThreadedView'
  	],    

	refs : [
	
	    {
			ref : 'mailsView',
	    	selector : '#servicemailsview'
	    },
	    {
	    	ref : 'tasksView',
	    	selector : '#mailtasksview'
	    },
	    {
	    	ref : 'searchPanel',
	    	selector : '#searchpanel'
	    },
	    {
	    	ref : 'threadedView',
	    	selector : '#threadedview'
	    },
	    {
	    	ref : 'serviceCombo',
	    	selector : 'servicecombo'
	    },
	    {
	    	ref : 'serviceFiltersCombo',
	    	selector : 'servicefilterscombo'
	    },
	    {
	    	ref : 'mailFiltersView',
	    	selector : 'mailfiltersview'
	    },
	    {
	    	ref : 'serviceMailsFilter',
	    	selector : 'servicemailsfilter'
	    },
	    {
	    	ref : 'mailsViewTabPanel',
	    	selector : '#mailsviewtabpanel'
	    },
	    {
	    	ref : 'synchronizeDisplayButton',
	    	selector : 'displayview #synchronize'
	    }
	    
	],
	
	/**
	 * @private
	 */
	statisticsView : null,
	
	init: function() {
		
		this.control({
			
			'mailsview': {
				selectionchange : this.onSelectionChange,
				itemdblclick : this.onItemDblClick,
				operation : this.onDowncomingOperation,
				threadchange : this.onThreadChange
			},
			
			'mainview' : {
				render : this.onMailsViewReady
			},
			
			'#servicemailsview' : {
				storeloaded : this.onServiceMailsViewLoad,
				gototasksview : this.onGoToTasksView
			},
			
			'#servicemailsview #statistics-button' : {
				click : this.onStatisticsButtonClick
			},

			'servicefilter' : {
				select : this.onSelectService
			},
			
			'servicemailsfilter' : {
				select : this.onSelectMailFilter
			},
			
			'#mailfiltersview' : {
				filtersChanged : this.onMailFiltersChanged
			},
			
			'#mailtasksview' : {
				storeloaded : this.onTasksStoreLoaded
			}
			
		});
		
		this.application.on({
			
			contextChanged : this.onContextChanged,
//			metaDataEdited : this.onMetaDataEdited,
			newDocumentAvailable : this.onNewDocumentAvailable,
			operation : this.onOperation,
			scope : this
			
		});
		
	},
	
	onDowncomingOperation : function(operationKind, context) {
		
		this.application.fireEvent('operation', operationKind, context);
		
	},
		
	onOperation : function(operationKind, context) {

		var 
			mailsView = this.getMailsView(),
			tasksView = this.getTasksView()
		;
		
		mailsView.refreshSingle(context /* id */, 'nodeRef' /* idParam */);
		
		if (Ext.String.startsWith(operationKind, 'update')) {
			tasksView.refreshSingle(context /* id */, 'nodeRef' /* idParam */);			
		} 
		else {
			tasksView.refresh();
		}
		
	},
	
	onGoToTasksView : function(records) {
		
		var 
			tasksView = this.getTasksView(),
			
			nodeRefs = Ext.Array.clean(Ext.Array.map(records, function(record) {
				return record.get('nodeRef');
			}))
		;
		
		this.setActiveTab(tasksView);
		var success =  this._selectTasksRecords(nodeRefs);
		
		if (!success) {
			// Should reload the view before the selection
			this.selectTasksRecordsOnLoad = nodeRefs;
			return;
		}
		
	},
	
	onTasksStoreLoaded : function(store) {
		
		if (null == this.selectTasksRecordsOnLoad) return;
		
		this._selectTasksRecords(this.selectTasksRecordsOnLoad);
		this.selectTasksRecordsOnLoad = null;
			
	},
	
	/**
	 * @return {Boolean} true if successfully selected, false if none was selected
	 */
	_selectTasksRecords : function (nodeRefs, suppressEvent /* false */) {
		
		var 
			tasksView = this.getTasksView(),
			store = tasksView.getStore(),
			selModel = tasksView.getSelectionModel(),
			
			selectedRecords = Ext.Array.clean(Ext.Array.map(nodeRefs, function(nodeRef) {
				return store.findRecord('nodeRef', nodeRef);
			}))
		;
		
		if (Ext.isEmpty(selectedRecords)) return false;
		selModel.select(selectedRecords, false /* keepExisting */, true === suppressEvent /* suppressEvent */);
		
		return true;
		
	},
	
	/**
	 * Analyze the window URL to decide whether an initial result should
	 * be displayed.
	 * Using nodeRef=<a_valid_nodeRef_value> displays the given document
	 * in the view
	 *  
	 */
	onMailsViewReady : function() {
		
		var 
			me = this,
			query = Ext.Object.fromQueryString(window.location.search || ''),
			nodeRef = query['nodeRef']
		;
		
		if (!nodeRef) return;
		
    	var 
			context = Ext.create('Yamma.utils.Context', {
	    		filters : [
					{
						property : 'nodeRef',
						value : nodeRef
					}
				]
	    	})
	    ;
		
    	Ext.defer(function() {
    		me.application.fireEvent('contextChanged', context);
    	}, 20);
		    	
	},
	
	onServiceMailsViewLoad : function(store, records) {
		
		if (null == store) return;
		if (store.getTotalCount() > 1) return;
		
		var 
			me = this,
			firstRecord = records[0]
		;
		
		Ext.defer(function() {
			var
				mailsView = me.getMailsView(),
				selectionModel = mailsView.getSelectionModel()
			;
			selectionModel.select(0);
			
			if (!me.isDisplaySynchronized()) {
				me.application.fireEvent('mailcontextchanged', firstRecord);
			}
			
		}, 20);
		
	},
	
	isDisplaySynchronized : function() {
		
		var synchronizeButton = this.getSynchronizeDisplayButton();
		if (!synchronizeButton) return false;
		
		return synchronizeButton.pressed;
		
	},
	
	onContextChanged : function(context) {
		
		var
			mailsView = this.getMailsView(),
			searchPanel = this.getSearchPanel()
		;
		
		// do not accept service-based only filters
		if (null == context) {
			mailsView.resetMailsView();
			return;
		}
		
		this.setActiveTab(searchPanel);
		
		if (context.isAdvancedSearchBased()) {
			mailsView.displaySearchResult(context);
			return;
		}
		
		// Default behavior
		mailsView.displayFilterBasedContent(context);
		
	},
	
	
//	/**
//	 * Executed when the metadata of the main document are edited.
//	 * 
//	 * Ideally, we should update the modified tuple locally in order to avoid a
//	 * full server datasource-request. However for the sake of simplicity, we
//	 * update the full view, keeping active selection (that point needs a little
//	 * hack).
//	 * 
//	 * @private
//	 * @param {String}
//	 *            nodeRef The nodeRef of the metadata-edited document.
//	 * @return {Boolean} `true` means "do refresh the form" (else the form not
//	 *         displayed anymore)
//	 */
//	onMetaDataEdited : function(nodeRef) {
//		
//		var 
//			me = this,
//			mailsView = this.getMailsView(),
//			tasksView = this.getTasksView()
//		;
//		
//		mailsView.refreshSingle();
//		tasksView.refreshSingle();
////		
////		/*
////		 * refresh & keepSelection will raise deselect/select, which we have to
////		 * manage locally in order to avoid propagation of selection/deselection
////		 * to the other components
////		 */
////		me.isRefreshing = true;
////		mailsView.refresh(
////			true, /* keepSelection */
////			function() {
////				me.isRefreshing = false;
////			} /* onRefreshPerformed */
////		);
////		
////		return true; // tells the edited form to update
//		
//	},
	
	onSelectionChange : function(selectionModel, selectedRecords, eOpts) {
		
		// Process the special case where the nodeRef is already loaded through ANOTHER record
		// Since there are at least 2 mail views, this is made possible
		var 
			threadedView = this.getThreadedView(),
			documentNodeRef = threadedView.getDocumentNodeRef(),
			record = selectedRecords.length == 0 ? null : selectedRecords[0],
			selectionNodeRef = Ext.isObject(record) ? record.get('nodeRef') : null
		;
			

		if (documentNodeRef && selectionNodeRef && documentNodeRef == selectionNodeRef) return; // ignore same nodeRef
		
		this.application.fireEvent('mailcontextchanged', null);
		this.updateThreadedView(record);
		
		if (!Ext.isObject(record)) {
			return;
		}
		
		if (record && this.isDisplaySynchronized()) {
			this.application.fireEvent('mailcontextchanged', record);
		}
				
	},
	
	onThreadChange : function(record) {
		
		this.updateThreadedView(record);
		
	},
	
	/**
	 * @private
	 */
	updateThreadedView : function(record) {
		
		if (true === this.isRefreshing) return; // ignore remove/new selection while refreshing
		
		var threadedView = this.getThreadedView();
		if (null == threadedView) return;
		
		if (null == record) {
			threadedView.clear();
		}
		else {
			threadedView.dload(record);
		}
		
	},
	
	onItemDblClick : function(view, record, item) {
		
		var me = this;
		
		Ext.defer(function(){
			me.application.fireEvent('mailcontextchanged', record);
		}, 20);
		
	},	
	
	onStateClick : function(nodeRef) {
		
		var detailsWindow = Ext.create('Yamma.view.windows.DetailsWindow', {
			documentNodeRef : nodeRef
		});
		
		detailsWindow.show();
		
	},
	
	onNewDocumentAvailable : function(documentInformation) {
		
		var mailsView = this.getMailsView();
		mailsView.refresh(true);
		
	},
	
	onStatisticsButtonClick : function() {
		
		var
			mailsView = this.getMailsView(),
			statisticsView = mailsView.getStatisticsView()
		;
		statisticsView[statisticsView.isVisible() ? 'hide' : 'show']();
		
	},
	
	
	setActiveTab : function(view) {
		
		if (null == view) {
			view = this.getSearchPanel();
		}
		
		var tabPanel = this.getMailsViewTabPanel();
		if (!tabPanel) return;
		
		tabPanel.setActiveTab(view);
		
	},
	
	getActiveTab : function() {
		
		var tabPanel = this.getMailsViewTabPanel();
		if (!tabPanel) return null;
		
		return tabPanel.getActiveTab();
		
	},
	
	onSelectService : function(picker, record) {
		
		var serviceFiltersCombo = this.getServiceFiltersCombo();
		serviceFiltersCombo.setValue('');
		
		this.onSelectMailFilter(serviceFiltersCombo, null);
		
	},
	
	onSelectMailFilter : function(picker, record) {
		
		var
			serviceCombo = this.getServiceCombo(),
			selectedService = serviceCombo.getValue(),
			contextFilters = record ? record.get('filters') : null,
			context = null 
		;
			
		if (null == selectedService) return; // no service selected
		
		if ('root' == selectedService) {
			selectedService = serviceCombo.getAccessibleSites();
		}
			
		context = Ext.create('Yamma.utils.Context', {
			service : selectedService,
			kind : contextFilters ? contextFilters.type : undefined,
			state : contextFilters ? contextFilters.state : undefined
		});
		
		this.application.fireEvent('contextChanged', context);
		
	},
	
	onMailFiltersChanged : function(view, context) {
		this.application.fireEvent('contextChanged', context);
	}
	

});