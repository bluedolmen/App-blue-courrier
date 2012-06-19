Ext.define('Bluexml.view.windows.ConfirmDialog', {

	extend : 'Ext.window.MessageBox',
	CONFIRM_BUTTON_TEXT : 'Ok',
	CANCEL_BUTTON_TEXT : 'Annuler',
	
	icon : Ext.Msg.QUESTION,
	height : 250,
	
	initComponent : function() {

		var me = this;
		this.buttons = [
			{
				text : me.CONFIRM_BUTTON_TEXT,
				handler : function() {
					me.performAction(onActionPerformed);
					
					function onActionPerformed() {
						me.close();
					}
				}
			},
			
			{
				text : me.CANCEL_BUTTON_TEXT,
				handler : function() {
					me.close();
				}
			}
		];
		
		this.callParent(arguments);
	},
	
	performAction : function(onActionPerformed) {
		// Should be overridden
		if (onActionPerformed) onActionPerformed();
	}
	
});