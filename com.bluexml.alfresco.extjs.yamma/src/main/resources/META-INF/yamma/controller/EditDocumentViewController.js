Ext.define('Yamma.controller.EditDocumentViewController', {

	extend : 'Ext.app.Controller',
	
	refs : [
	
	    {
			ref : 'editDocumentView',
	    	selector : 'editdocumentview'
	    },
	
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
		
		this.callParent(arguments);
		
	},
	
	onSuccessfulEdit : function(formPanel, nodeRef) {
		
		var mailsView = this.getMailsView();
		if (!mailsView) return;
		
//		this.suspendEvents(true);
//		mailsView.refreshSelected();
		mailsView.refresh(true);
//		mailsView.nextDocument();
		
//		this.resumeEvents();
	}
	
			
});