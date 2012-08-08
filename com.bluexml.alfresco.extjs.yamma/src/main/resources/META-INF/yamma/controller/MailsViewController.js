Ext.define('Yamma.controller.MailsViewController', {
	
	extend : 'Ext.app.Controller',
	uses : [
		'Yamma.view.windows.DetailsWindow'
	],

	refs : [
	
	    {
			ref : 'mailsView',
	    	selector : 'mailsview'
	    }	    
	    
	],	
	
	init: function() {
		
		this.control({
			'mailsview': {
				selectionchange : this.onSelectionChange,
				stateClick : this.onStateClick
			}
		});
		
		this.application.on({
			contextChanged : this.onContextChanged,
			metaDataEdited : this.onMetaDataEdited,
			scope : this
		});
		
	},
	
	onContextChanged : function(context) {
		
		if (context.isAdvancedSearchBased()) {
			this.displaySearchResult(context);
			return;
		}
		
		// Default behavior
		this.displayFilterBasedContent(context);
		
	},
	
	displayFilterBasedContent : function(context) {
		
		var filters = context.getDocumentDatasourceFilters();
		var label = context.getLabel();
		
		var mailsView = this.getMailsView();
		mailsView.load(
			/* storeConfig */
			{
				filters : filters
			},
			
			/* proxyConfig */
			null,
			
			/* extraConfig */
			{
				ref : '^' + label
			}
		);
		
	},
	
	displaySearchResult : function(context) {

		var query = context.getQuery();
		var term = context.getTerm();
		if (!query && !term) return;
		
		var label = context.getLabel() || 'Recherche avancée';
		var encodedQuery = Ext.JSON.encode(query);
		
		var mailsView = this.getMailsView();
		mailsView.load(
			null, /* storeConfig */
			
			{
				extraParams : {
					query : encodedQuery,
					term : term
				}
			}, /* proxyConfig */
			
			{
				ref : '^' + label
			} /* extraConfig */
		);		
		
	},
	
	/**
	 * Executed when the metadata of the main document are edited.
	 * 
	 * Ideally, we should update the modified tuple locally in order to avoid a
	 * full server datasource-request. However for the sake of simplicity, we
	 * update the full view, keeping active selection (that point needs a little
	 * hack).
	 * 
	 * @private
	 * @param {String}
	 *            nodeRef The nodeRef of the metadata-edited document.
	 * @return {Boolean} `true` means "do refresh the form" (else the form not
	 *         displayed anymore)
	 */
	onMetaDataEdited : function(nodeRef) {
		
		var 
			me = this,
			mailsView = this.getMailsView()
		;
		
		/*
		 * refresh & keepSelection will raise deselect/select, which we have to
		 * manage locally in order to avoid propagation of selection/deselection
		 * to the other components
		 */
		me.isRefreshing = true;
		mailsView.refresh(
			true, /* keepSelection */
			function() {
				me.isRefreshing = false;
			} /* onRefreshPerformed */
		);
		
		return true; // tells the edited form to update
	},
	
	onSelectionChange : function(selectionModel, selectedRecords, eOpts) {
		if (true === this.isRefreshing) { return; } // ignore remove/new selection while refreshing 
		
		if (selectedRecords.length == 0) {
			this.application.fireEvent('clearselectedmail');
		} else {
			this.application.fireEvent('newmailselected', selectedRecords[0]);
		}
	},
		
	onStateClick : function(nodeRef) {
		var detailsWindow = Ext.create('Yamma.view.windows.DetailsWindow', {
			documentNodeRef : nodeRef
		});
		
		detailsWindow.show();
	}	
	

});