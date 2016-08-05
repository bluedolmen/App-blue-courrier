Ext.define('Yamma.view.mails.SearchPanel', {
	
	requires : [
		'Yamma.view.mails.MailsView',
		'Yamma.view.mails.MailFiltersView'
	],
	
	extend : 'Ext.panel.Panel',
	
	alias : 'widget.searchpanel',
	
	title : 'Rechercher',
	
	layout : 'border',
	
	defaults : {
		height : '100%',
		border : 0,
		margin : 0
	},
	
	
	initComponent : function() {
		
		this.items = [
 		    {
 		    	xtype : 'mailfiltersview',
 		    	id : 'mailfiltersview',
 		    	region : 'west',
 		    	width : 250,
 				autoScroll : true,
 				margin : 2,
 				border : 1,
 				title : 'Services (filtres)',
 				headerPosition : 'top',
 				split : true,
 				collapsible : true,
 				collapsed : false,
 				tools: [
 				    {
	 			        itemId: 'refresh',
	 			        type: 'refresh',
	 			        callback: this.resetMailsView,
	 			        scope : this
	 			    }
 			    ]
 		    },
 			{
 				xtype : 'mailsview',
 				region : 'center',
 				headerPosition : 'right',
 				iconCls : Yamma.Constants.getIconDefinition('magnifier').iconCls,
 				title : 'Courriers',
 				border : '0 0 0 1px',
 				margin : '2px 2px 2px 2px',
 				id : 'servicemailsview',
 				flex : 1
 			}
 		];
		
		this.callParent();
		
		this._filterPanel = this.queryById('mailfiltersview');
		this._mailsView = this.queryById('servicemailsview');
		
		this._filterPanel.on('expand', this.onFilterExpand, this /* scope */);
		this.on('sortby', this.onSortingChanged, this);
		
	},
	
	displayContext : function(context) {

		if (context.isAdvancedSearchBased()) {
			this.displaySearchResult(context);
		}
		else {
			
			if (null != this.currentContext && null != context) {
				this.currentContext.merge(context);
				context = this.currentContext;
			}
			
			this.displayFilterBasedContent(context);
		}

		this.currentContext = context; // save the current context for future use

	},
	
	displayFilterBasedContent : function(context, storeExtraConfig) {
		
		if (!context) return;
		
		var 
			filters = context.getDocumentDatasourceFilters(),
			label = context.getLabel()
		;

		this._mailsView.clearStoredFilters(true /* suppressEvents */);
		this._mailsView.filter(filters, label);
		
	},
	
	
	resetMailsView : function() {

		this.currentContext = null;
		
		this._mailsView.resetTitleToDefault();
		this._mailsView.clearStore();
		this._mailsView.clearStoredFilters();
		
		this.clearFilterSelection();
		this._mailsView.setFilterButtonDisabled(false);
		
	},
	
	displaySearchResult : function(context) {
		
		
		var 
			query = context.getQuery(),
			term = context.getTerm(),
			label = context.getLabel(),
			encodedQuery
		;
		if (!query && !term) return;
		
		/*
		 * The search result takes place in a context where filters are provided
		 * on the left part.
		 * These filters have to be hidden since they cannot be used to additionnaly
		 * filter the result (facetted search).
		 * Event if this feature would be useful, we should preferably implement
		 * this only on version 5.x where facetted search is a native feature.
		 */
		this.clearFilterSelection();
		this._mailsView.setFilterButtonDisabled(true);
		this._filterPanel.collapse(Ext.Component.DIRECTION_LEFT);
		
		encodedQuery = Ext.JSON.encode(query);
		
		this._mailsView.load(
			null, /* storeConfig */
			
			{
				extraParams : {
					query : encodedQuery,
					term : term
				}
			}, /* proxyConfig */
			
			{
				ref : label ? '^' + label : null
			} /* extraConfig */
		);
		
	},
	
	/**
	 * Removes the selection of the filter panel to avoid the user
	 * to misinterpret the results
	 * 
	 * @private
	 */
	clearFilterSelection : function() {
		
		this._filterPanel.clearFilterSelection(true /* suppressEvents */);
		
	},
	
	onFilterExpand : function(filtersView) {
		
		if (this.currentContext && this.currentContext.isAdvancedSearchBased()) {
			this.resetMailsView();
		}
		
	},
	
	/**
	 * Bubbled from MailsView 
	 */	
	onSortingChanged : function(sortProperty, sortAscending) {
		
		var sorters = [{
	    	property : sortProperty,
	    	direction : sortAscending ? 'ASC' : 'DESC'		
		}];
		
		this._mailsView.updateSorters(sorters);
		
		this.displayContext(this.currentContext);
		
	}
		
//	onGroupingChanged : function(groupProperty, groupAscending) {
//		
//		var groupers = [{
//	    	property : groupProperty,
//	    	direction : groupAscending ? 'ASC' : 'DESC'		
//		}];
//		
//		this.displayContext(this.currentContext, { groupers : groupers } /* storeExtraConfig */);
//		
//	}
	
	
});