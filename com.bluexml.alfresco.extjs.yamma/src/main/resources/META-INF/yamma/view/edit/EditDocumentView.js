Ext.define('Yamma.view.edit.EditDocumentView', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.editdocumentview',
	
	requires : [
		'Yamma.view.edit.EditDocumentForm',
		'Yamma.view.comments.CommentsView',
		'Yamma.view.attachments.AttachmentsView'
	],
	
	layout : 'accordion',
    layoutConfig: {
		titleCollapse: false,
		animate: false
    },
	
	items : [
		{
			xtype : 'editdocumentform'
		},
		{
			xtype : 'attachmentsview'
		},
		{
			xtype : 'commentsview'
		}
	],
	
	updateContext : function(nodeRef, typeShort) {
		
		if (!nodeRef) {
			Ext.Error.raise('IllegalArgumentException! The provided nodeRef is not valid');
		}
		
		var 
			editDocumentForm = this.getEditDocumentForm(),
			commentsView = this.getCommentsView(),
			attachmentsView = this.getAttachmentssView()
		;
		
		editDocumentForm.loadDocument(nodeRef);
		commentsView.loadComments(nodeRef);
		attachmentsView.loadAttachments(nodeRef);
		
	},
	
	getEditDocumentForm : function() {
		if (!this.editDocumentForm) { 
			this.editDocumentForm = this.child('editdocumentform');
		}
		return this.editDocumentForm;
	},
	
	getCommentsView : function() {
		if (!this.commentsView) {
			this.commentsView = this.child('commentsview');
		}
		return this.commentsView;
	},
	
	getAttachmentssView : function() {
		if (!this.attachmentsView) {
			this.attachmentsView = this.child('attachmentsview');
		}
		return this.attachmentsView;
	},
	
	clear : function() {
		
		var 
			editDocumentForm = this.getEditDocumentForm(),
			commentsView = this.getCommentsView(),
			attachmentsView = this.getAttachmentssView()
		;
		
		editDocumentForm.clear();
		commentsView.clear();
		attachmentsView.clear();
		
	}
	
	
});