Ext.define('Yamma.view.EditDocumentView', {

	extend : 'Bluexml.view.forms.panel.EditFormPanel',
	alias : 'widget.editdocumentview',
	iconCls : 'icon-page_white_edit',
	
	config : {
		context : {
			nodeRef : null,
			typeShort : null
		}
	},
	
	displayEditForm : function(nodeRef, typeShort) {
		
		if (!nodeRef) {
			Ext.Error.raise('IllegalArgumentException! The provided nodeRef is not valid');
		}
		
		this.setContext({
			nodeRef : nodeRef,
			typeShort : typeShort || null
		});
		
		this.loadNode(nodeRef, {
			formConfig : {
				showCancelButton : false
			}
		});
		
	},
	
	refresh : function() {
		
		this.load();
		
	},
	
	clear : function() {
		
		this.removeAll();
		
	}	
	
});