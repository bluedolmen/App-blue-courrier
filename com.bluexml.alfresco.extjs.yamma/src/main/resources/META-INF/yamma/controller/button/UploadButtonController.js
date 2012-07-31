Ext.define('Yamma.controller.button.UploadButtonController', {
	
	extend : 'Ext.app.Controller',
	
	uses : [
		'Yamma.view.windows.UploadFormWindow'
	],

	refs : [
	
	    {
			ref : 'uploadButton',
	    	selector : 'uploadbutton'
	    }	    
	    
	],	
	
	init: function() {
		
		this.application.on({
			contextChanged : this.onContextChanged,
			scope : this
		});
		
		this.control({
			'uploadbutton': {
				click : this.onUploadClick
			}
		});		
		
	},
	
	onContextChanged : function(context) {		
		this.updateButtonState(context);
	},
	
	updateButtonState : function(context) {

		var 
			uploadButton = this.getUploadButton(),
			tray = context.getTray();
			
		if (tray) {
			if (!uploadButton.updateTrayContext(tray)) return;
			uploadButton.enable();
		} else {
			uploadButton.resetTrayContext();
			uploadButton.disable();
		}		
		
	},
	
	onUploadClick : function() {
		this.showUploadForm();		
	},
		
	showUploadForm : function() {
		
		var uploadButton = this.getUploadButton();
		
		Ext.create('Yamma.view.windows.UploadFormWindow', {
			title : 'Choisissez un fichier',
			formConfig : {
				additionalFields : [{
					name : 'destination',
					value : uploadButton.getDestination()
				}]
			}
		}).show();
		
	}	

});