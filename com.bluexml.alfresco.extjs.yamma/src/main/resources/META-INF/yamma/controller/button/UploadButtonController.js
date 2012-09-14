/**
 * The UploadButton controller.
 * 
 * The upload button displays an upload-form on click. The upload is
 * contextualized to the current displayed tray.
 * 
 * The button is made inactive if the currently displayed list of
 * mails/documents is not related to an actual tray.
 */
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
	
	/**
	 * @private
	 * 
	 * @param {Yamma.utils.Context}
	 *            context the new global context
	 */
	onContextChanged : function(context) {		
		this.updateButtonState(context);
	},
	
	/**
	 * Update the document state of the button regarding the global context
	 * 
	 * @private
	 * @param {Yamma.utils.Context}
	 *            context the new global context
	 */
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
	
	/**
	 * Button click-handler.
	 *
	 * @private
	 */
	onUploadClick : function() {
		this.showUploadForm();		
	},
		
	/**
	 * Displays an upload form to the current destination.
	 * 
	 * @private
	 */
	showUploadForm : function() {
		
		var 
			me = this,
			uploadButton = this.getUploadButton();
		
		Ext.create('Yamma.view.windows.UploadFormWindow', {
			
			title : 'Choisissez un fichier',
			
			formConfig : {
				additionalFields : [{
					name : 'destination',
					value : uploadButton.getDestination()
				}]
			},
			
			onSuccess : function(response) {
				var jsonResponse = response.responseJSON;
				if (!jsonResponse) return;
				
				me.application.fireEvent('newDocumentAvailable', {
					nodeRef : jsonResponse.nodeRef,
					name : jsonResponse.fileName
				});
			}
			
		}).show();
		
	}	

});