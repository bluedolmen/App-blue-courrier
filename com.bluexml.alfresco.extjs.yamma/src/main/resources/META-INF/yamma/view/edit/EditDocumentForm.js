Ext.define('Yamma.view.edit.EditDocumentForm', {
	
	extend : 'Bluexml.view.forms.panel.EditFormPanel',
	alias : 'widget.editdocumentform',
	
	mixins : ['Yamma.view.edit.DeferredLoading'],
	
	title : 'Métadonnées',
	iconCls : 'icon-page_white_edit',
	
	/**
	 * @private
	 * @type String
	 */
	editedDocumentNodeRef : null,
	
	loadInternal : function() {
		this.loadDocument.apply(this, arguments);
	},
	
	loadDocument : function(nodeRef, formId) {
				
		this.loadNode(
			nodeRef,
			{
				formConfig : {
					showCancelButton : false,
					formId : formId
				}
			} /* extra-config */
		);
		
		// Has to be called after loadNode, since loadNode will call clear() as a side-effect
		this.editedDocumentNodeRef = nodeRef;
	},
	
	clear : function() {
		this.editedDocumentNodeRef = null;
		this.callParent();
	},
	
	getEditedDocumentNodeRef : function() {
		return this.editedDocumentNodeRef;
	},
	
	onSuccess : function() {
		var eventArgs = ['successfulEdit', this, this.getEditedDocumentNodeRef()];
		this.fireEvent.apply(this, eventArgs);
	}	

	
});