Ext.define('Bluedolmen.utils.alfresco.forms.EditFormFrame',{

	extend : 'Bluedolmen.utils.alfresco.forms.FormFrame',
	alias : 'widget.editformframe',
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'extjseditform',
	
	defaultFormConfig : {
		showCancelButton : true
	},	
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
	
});