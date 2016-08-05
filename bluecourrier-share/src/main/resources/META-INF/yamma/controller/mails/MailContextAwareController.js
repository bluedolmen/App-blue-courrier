Ext.define('Yamma.controller.mails.MailContextAwareController', {

	extend : 'Ext.app.Controller',
	
	init : function() {
		
		this.application.on({
			mailcontextchanged : this.onMailContextChanged,
			scope : this
		});		
		
		this.callParent(arguments);
	},
	
	onMailContextChanged : function(newMailRecord) {
		// DO NOTHING by default
	}
	
});