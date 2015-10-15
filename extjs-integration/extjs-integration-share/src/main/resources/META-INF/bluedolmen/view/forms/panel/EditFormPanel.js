Ext.define('Bluedolmen.view.forms.panel.EditFormPanel', {
	
	extend : 'Bluedolmen.view.forms.panel.FormPanel',
	mixins : [
		'Bluedolmen.view.forms.common.EditFormDefinition'
	],
	alias : 'widget.editformpanel',
	
	statics : {
		SUCCESSFUL_EDIT_EVENT_NAME : 'successfulEdit' // TODO => use this constants
	},
	
	constructor : function() {
		
		this.addEvents('successfulEdit');
		this.callParent(arguments);
	},
	
	onSuccess : function() {
		var eventArgs = ['successfulEdit', this].concat(arguments);
		this.fireEvent.apply(this, eventArgs);
		this.callParent(arguments);
	}	

});