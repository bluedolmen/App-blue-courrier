Ext.define('Yamma.view.edit.EditDocumentForm', {
	
	extend : 'Bluexml.view.forms.panel.EditFormPanel',
	alias : 'widget.editdocumentform',
	
	title : 'Métadonnées',
	iconCls : 'icon-page_white_edit',
	
	/**
	 * @private
	 * @type String
	 */
	editedDocumentNodeRef : null,
	
	loadDocument : function(nodeRef) {
				
		this.loadNode(nodeRef, {
			formConfig : {
				showCancelButton : false
			}
		});
		
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