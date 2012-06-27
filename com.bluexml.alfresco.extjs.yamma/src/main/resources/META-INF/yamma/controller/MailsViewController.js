Ext.define('Yamma.controller.MailsViewController', {
	extend : 'Ext.app.Controller',
		
	init: function() {
		
		this.control({
			'mailsview': {
				selectionchange : this.onSelectionChange,
				itemclick : this.onItemClick
			}
		});
		
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