Ext.define('Bluedolmen.utils.alfresco.grid.ConfirmedAction', {
	
	uses : [
		'Bluedolmen.windows.ConfirmDialog'
	],

	confirmTitle : "Exécuter l'action",
	confirmMessage : "Confirmez-vous l'exécution de cette action ?",
	
	askConfirmation : function() {
		
		var
			me = this,
			args = arguments
		;
		
		Bluedolmen.windows.ConfirmDialog.FR.askConfirmation({
			title : this.confirmTitle,
			msg : this.confirmMessage,
			onConfirmation : function() {
				var params = ['preparationReady'].concat(Ext.Array.slice(args));
				me.fireEvent.apply(me, params);
			}
		});
		
	}
	
});