Ext.define('Yamma.controller.edit.EditDocumentViewController', {
	
	extend : 'Yamma.controller.mails.MailContextAwareController',
	
	views : [
  		'edit.EditDocumentView'
  	],    

	refs : [
	
	    {
			ref : 'editDocumentView',
	    	selector : 'editdocumentview'
	    },
	    {
	    	ref : 'editDocumentForm',
	    	seletor : 'editdocumentform'
	    }
	    
	],
	
	init: function() {
		
		this.control({
			
			'editdocumentform': {
				successfulEdit : this.onSuccessfulEdit
			}
			
		});
		
		this.application.on({
			
			scope : this
			
		});
		
		this.callParent();
		
	},
	
	onSuccessfulEdit : function(formPanel, nodeRef) {
		
		var me = this;
		
		formPanel.refresh();
		
		Ext.defer(function() {
			me.application.fireEvent('operation', 'update-properties', nodeRef);
		}, 30);
		
	},

	onMailContextChanged : function(mailRecord) {
		
		var editDocumentView = this.getEditDocumentView();
		
		if (null == mailRecord) {
			editDocumentView.clear();
		}
		else {
			editDocumentView.updateContext(mailRecord);
		}
		
	}	
	

});