Ext.define('Yamma.controller.EditDocumentViewController', {

	extend : 'Ext.app.Controller',
	
	refs : [
		{
			ref : 'mailsView',
			selector : 'mailsview'
		}
	
	],
	
	init : function() {
		this.control({
			'editdocumentview': {
				successfulEdit : this.onSuccessfulEdit
			}
		});		
	},
	
	onSuccessfulEdit : function(nodeRef) {
		
		var mailsView = this.getMailsView();
		if (!mailsView) return;
		
//		this.suspendEvents(true);
//		mailsView.refreshSelected();
		mailsView.refresh(true);
//		mailsView.nextDocument();
		
//		this.resumeEvents();
	}
	
});