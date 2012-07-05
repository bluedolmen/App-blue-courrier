Ext.define('Yamma.controller.EditDocumentViewController', {

	extend : 'Yamma.controller.MailSelectionAwareController',
	
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
	
	onSuccessfulEdit : function(nodeRef) {
		
		var mailsView = this.getMailsView();
		if (!mailsView) return;
		
//		this.suspendEvents(true);
//		mailsView.refreshSelected();
		mailsView.refresh(true);
//		mailsView.nextDocument();
		
//		this.resumeEvents();
	},
	
	onNewMailSelected : function(newMailRecord) {
		var nodeRef = newMailRecord.get('nodeRef');
		if (!nodeRef) return;
		
		var typeShort = newMailRecord.get('typeShort');
		if (!typeShort) return;
		
		this.displayEditForm(nodeRef, typeShort);
	},
	
	onClearSelectedMail : function() {
		var editDocumentView = this.getEditDocumentView();
		if (editDocumentView) editDocumentView.removeAll();
	},
	
	displayEditForm : function(nodeRef, typeShort) {
		
		var editDocumentView = this.getEditDocumentView();
		if (!editDocumentView) return;
		
		editDocumentView.loadNode(nodeRef, {
			formConfig : {
				showCancelButton : false
			}
		});		    	
		
	}	
	
});