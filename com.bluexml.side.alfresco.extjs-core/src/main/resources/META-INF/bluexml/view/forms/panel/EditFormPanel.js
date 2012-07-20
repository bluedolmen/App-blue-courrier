Ext.define('Bluexml.view.forms.panel.EditFormPanel', {
	
	extend : 'Bluexml.view.forms.panel.FormPanel',
	mixins : [
		'Bluexml.view.forms.common.EditFormDefinition'
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
		this.fireEvent('successfulEdit', this, arguments[0]);
		this.callParent(arguments);
	}	

});