Ext.define('Bluedolmen.utils.alfresco.forms.EditTaskFrame',{

	extend : 'Bluedolmen.utils.alfresco.forms.FormFrame',
	alias : 'widget.edittaskframe',
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'extjsedittask',		

//	defaultFormConfig : {
//		taskId : null
//	},	
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		// override => DO NOTHING
	}
	
	
});