Ext.define('Yamma.controller.MailSelectionAwareController', {

	extend : 'Ext.app.Controller',
	
	init : function() {
		
		this.application.on({
			newmailselected : this.onNewMailSelected,
			clearselectedmail : this.onClearSelectedMail,
			scope : this
		});		
		
		this.callParent(arguments);
	},
	
	onNewMailSelected : function(newMailRecord) {
		// DO NOTHING by default
	},
	
	onClearSelectedMail : function() {
		// DO NOTHING by default		
	}
	
});