Ext.define('Bluexml.utils.alfresco.forms.SearchFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.searchformframe',
	
//	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'standalonesearchform',	
	
	defaultFormConfig : {
		itemKind : 'type',
		mode : 'edit',
		formId : 'search',
		single : true
	}	

});