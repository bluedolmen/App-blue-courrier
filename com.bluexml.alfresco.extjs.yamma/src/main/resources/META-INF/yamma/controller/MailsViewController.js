Ext.define('Yamma.controller.MailsViewController', {
	extend : 'Ext.app.Controller',

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
				itemclick : this.onItemClick
			}
		});
		
		this.application.on({
			contextChanged : this.onContextChanged,
			scope : this
		});
		
	},
	
	onContextChanged : function(context) {		
		this.displayTrayContent(context);
	},
	
	displayTrayContent : function(context) {
		
		var mailsView = this.getMailsView();
		if (!mailsView) return;
		
		var filters = context.getDocumentDatasourceFilters();
		var label = context.getLabel();
		
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
	
	onSelectionChange : function(selectionModel, selectedRecords, eOpts) {
		
		if (!selectedRecords || !Ext.isArray(selectedRecords) || selectedRecords.length == 0) {
			this.application.fireEvent('clearselectedmail');
			return;
		}
		
		var firstSelectedRecord = selectedRecords[0];
		this.application.fireEvent('newmailselected', firstSelectedRecord);
	},
	
	onItemClick : function(view, record, item) {
		//this.displayItem(record);
	}
	

});