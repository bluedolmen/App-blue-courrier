Ext.define('Bluexml.utils.alfresco.forms.SearchFormFrame',{

	extend : 'Bluexml.utils.alfresco.forms.FormFrame',
	alias : 'widget.searchformframe',
	
//	defaultFormConfig : {
//		itemKind : 'type',
//		mode : 'edit',
//		formId : 'search',
//	}		
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'extjssearchform',
	
	onReceivedMessage : function(event) {
		
		var eventDescription = this.getMessageEventDescription(event);
		if (!eventDescription) return;
		
		var 
			eventType = eventDescription.eventType,
			data = eventDescription.data
		;
		
		if ('search' != eventType) 
			return this.callParent(arguments);
		
		this.onSearch(data);
	},
	
	onSearch : function(data) {
		
		var 
			term = data.term,
			query = data.formData
		;
		this.fireEvent('formaction', 'search', term, query);
		
	}

});