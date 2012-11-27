Ext.define('Yamma.view.edit.EditDocumentView', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.editdocumentview',
	
	requires : [
		'Yamma.view.edit.EditDocumentForm',
		'Yamma.view.comments.CommentsView',
		'Yamma.view.attachments.AttachmentsView',
		'Yamma.utils.datasources.Documents'
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
	
	updateContext : function(context) {
		
		var
			nodeRef = context.get('nodeRef') || Ext.Error.raise('IllegalArgumentException! The provided nodeRef is not valid'),
			origin = context.get(Yamma.utils.datasources.Documents.MAIL_ORIGIN_QNAME),
			state = context.get(Yamma.utils.datasources.Documents.STATUSABLE_STATE_QNAME),
			
			formId = ('manual' === origin ? 'fill-online' : 'state_' + state),
			editDocumentForm = this.getEditDocumentForm(),
			commentsView = this.getCommentsView(),
			attachmentsView = this.getAttachmentssView()
		;
		
		editDocumentForm.dload(nodeRef, formId);
		commentsView.dload(nodeRef);
		attachmentsView.dload(nodeRef);
		
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