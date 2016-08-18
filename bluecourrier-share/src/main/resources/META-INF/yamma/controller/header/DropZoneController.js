Ext.define('Yamma.controller.header.DropZoneController', {
	
	extend : 'Ext.app.Controller',
	
	uses : [
		'Yamma.view.windows.UploadFormWindow'
	],

	refs : [
	
	    {
			ref : 'dropZone',
	    	selector : 'dropzone'
	    }	    
	    
	],	
	
	init: function() {
		
		this.application.on({
			contextChanged : this.onContextChanged,
			scope : this
		});
		
		this.control({
			'dropzone': {
				click : this.onDropZoneClick
			}
		});		
		
	},
	
	onContextChanged : function(context) {		
		this.updateDropZone(context);
	},
	
	updateDropZone : function(context) {

		var dropZone = this.getDropZone();
		if (!dropZone) return;
		
		var tray = context.getTray();
		if (tray) {
			if (!dropZone.updateTrayContext(tray)) return;
			dropZone.enable();
		} else {
			dropZone.disable();
		}		
		
	},
	
	/**
	 * Display a select file box
	 * @param {} event
	 */
	onDropZoneClick : function(event) {
		this.showUploadForm();
	},
	
	showUploadForm : function() {
		
		var dropZone = this.getDropZone();
		if (!dropZone) return;		
		
		Ext.create('Yamma.view.windows.UploadFormWindow', {
			title : i18n.t('controller.dropzone.uploadform.title'),
			formConfig : {
				additionalFields : [{
					name : 'destination',
					value : dropZone.getDestination()
				}]
			}
		}).show();
		
	}

});