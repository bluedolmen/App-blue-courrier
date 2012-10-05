Ext.define('Bluexml.utils.alfresco.forms.CreateFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.createformframe',
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'extjscreateform',	
	
	defaultFormConfig : {
		showCancelButton : true
	},
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
});