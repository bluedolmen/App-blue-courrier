Ext.define('Bluexml.utils.alfresco.forms.CreateFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.createformframe',
	
	defaultFormConfig : {
		itemKind : 'type',
		mode : 'create',
		editInline : true,
		googleEditable : true		
	},
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
});