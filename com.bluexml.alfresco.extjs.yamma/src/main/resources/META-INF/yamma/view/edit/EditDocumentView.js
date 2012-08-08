Ext.define('Yamma.view.edit.EditDocumentView', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.editdocumentview',
	
	requires : [
		'Yamma.view.edit.EditDocumentForm',
		'Yamma.view.comments.CommentsView'
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
			xtype : 'commentsview'
		}
	],
	
	updateContext : function(nodeRef, typeShort) {
		
		if (!nodeRef) {
			Ext.Error.raise('IllegalArgumentException! The provided nodeRef is not valid');
		}
		
		var 
			editDocumentForm = this.child('editdocumentform'),
			commentsView = this.child('commentsview')
		;
		
		editDocumentForm.loadDocument(nodeRef);
		commentsView.loadComments(nodeRef);
		
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
	
	clear : function() {
		
		var
			editDocumentForm = this.getEditDocumentForm(),
			commentsView = this.getCommentsView()
		;
		editDocumentForm.clear();
		commentsView.clear();
		
	}
	
	
});