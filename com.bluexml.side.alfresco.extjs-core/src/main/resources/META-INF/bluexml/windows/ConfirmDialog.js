Ext.define('Bluexml.windows.ConfirmDialog', {

	extend : 'Ext.window.MessageBox',

	height : 250,	
	
	askConfirmation : function(messageBoxConfig /* or Title */, message, onConfirmation, scope) {

		onConfirmation = onConfirmation || messageBoxConfig.onConfirmation;
		scope = scope || this;
		
		if (Ext.isString(messageBoxConfig)) {
			
            messageBoxConfig = {
                title: messageBoxConfig,
                msg: message
            };
            
        };
        
        // apply default arguments
		messageBoxConfig = Ext.apply({
			icon : Ext.Msg.QUESTION,
			buttons: this.YESNO,
			fn : onButtonClicked 
		}, messageBoxConfig);
		
		this.show(messageBoxConfig);
		
		
		function onButtonClicked(buttonId) {
			if ('yes' !== buttonId) return;			
			if (onConfirmation) onConfirmation.call(scope);
		}
		
	}
	
	
}, function() {
	Bluexml.windows.ConfirmDialog.INSTANCE = new this();
	
	Bluexml.windows.ConfirmDialog.FR = new this();
	Bluexml.windows.ConfirmDialog.FR.buttonText.yes = 'Oui';
	Bluexml.windows.ConfirmDialog.FR.buttonText.no = 'Non';
	
});