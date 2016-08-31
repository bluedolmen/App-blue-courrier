Ext.define('Yamma.view.mails.gridactions.ManageTask', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	requires : [
		'Bluedolmen.view.forms.window.EditTaskWindow'
	],
	
	icon : Yamma.Constants.getIconDefinition('cog').icon,
	tooltip : i18n.t('view.mails.gridactions.managetask.title'),
	
	supportBatchedNodes : false,
	
	performAction : function(taskRef, preparationContext) {
		
		var me = this;
		
		this.editForm = Ext.create('Bluedolmen.view.forms.window.EditTaskWindow');
		this.editForm.on({
			'formsuccess' : function() {
				me.fireEvent('actionComplete', 'success', arguments);
			},
			'formerror' : function() {
				me.fireEvent('actionComplete', 'failure', arguments);
			}
		});
			
		this.editForm.load({
			formConfig : {
				itemId : taskRef
			}
		});
		
		// do not call parent
		
	}
	
});