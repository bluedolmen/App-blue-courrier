Ext.define('Bluedolmen.view.forms.window.LongTimeRunningFormWindow', {
	
	extend : 'Bluedolmen.view.forms.window.FormWindow',

	defaultFormActionBehaviour : function() {
		
		this.closeWaitingMessageBox();
		this.callParent(arguments);
		
	},
	
	onSubmit : function() {
		
		this.displayWaitingMessageBox();
		this.callParent(arguments);
		
	},
	
	displayWaitingMessageBox : function() {
		
		this.waitingMessageBox = Ext.MessageBox.show({
           msg : this.title || 'Traitement de l\'opération',
           progressText : 'en cours...',
           width : 300,
           wait : true,
           waitConfig : { interval:200 },
           iconCls : 'icon-hourglass_go'
       });
		
	},
	
	closeWaitingMessageBox : function() {

		if (this.waitingMessageBox && this.waitingMessageBox.isVisible()) {
			this.waitingMessageBox.close();
		}		
		
	}
	

	
});