Ext.define('Bluexml.utils.alfresco.forms.EditFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.editformframe',
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'extjseditform',
	
//	defaultFormConfig : {
//		itemKind : 'node',
//		mode : 'edit'
//	},	
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
	
});