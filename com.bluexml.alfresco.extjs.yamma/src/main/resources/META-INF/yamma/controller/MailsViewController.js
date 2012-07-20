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
	
	
	onMetaDataEdited : function(nodeRef) {
		
		var mailsView = this.getMailsView();
		mailsView.refresh();
		
	},
	
	onSelectionChange : function(selectionModel, selectedRecords, eOpts) {
		
		if (!selectedRecords || !Ext.isArray(selectedRecords) || selectedRecords.length == 0) {
			this.application.fireEvent('clearselectedmail');
			return;
		}
		
		var firstSelectedRecord = selectedRecords[0];
		this.application.fireEvent('newmailselected', firstSelectedRecord);
	},
	
	onStateClick : function(nodeRef) {
		var detailsWindow = Ext.create('Yamma.view.windows.DetailsWindow', {
			documentNodeRef : nodeRef
		});
		
		detailsWindow.show();
	}	
	

});