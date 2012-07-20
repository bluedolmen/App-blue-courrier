Ext.define('Yamma.view.windows.DropZone', {

	extend : 'Ext.Component',
	alias : 'widget.dropzone',
	
	requires : [
		'Ext.window.MessageBox'
	],
	
	statics : {
		
		/**
		 * Extract the list of dropped files given a 'drop' event.
		 * 
		 * @returns {FileList} the list of the dropped files as returned in the event
		 */
		getDroppedFiles : function(eventObject) {
			
			var browserEvent = eventObject.browserEvent;
			if (!browserEvent) {
				Ext.log('Cannot get browserEvent from the ExtJS event-object');
				return null;
			}
			
			var dataTransfer = browserEvent.dataTransfer;
			if (!dataTransfer) {
				Ext.log('Cannot get the dataTransfer from the browser-event object. Drag&Dropping files probably not supported by your browser.');
				return null;
			}
			
			return dataTransfer.files;
		}
		
	},
	
	ALFRESCO_UPLOAD_URL : 'alfresco://api/upload',
	
    id: 'DocumentDropZone',
    
    height: 100,
    border: false,
    ddGroup: 'documentsDDGroup',
    cls : 'drop-zone',
    disabled : true,
    disabledCls : 'drop-zone-disabled',
    maskOnDisable : false,
    tpl : '<div id="label">{tray}</div>',
 
    dropActivated : true,
    targetContext : null,
    
    listeners : {
    	
    	enable : function() {
	    	this.removeCls('drop-zone-inactive');
	    	this.addCls('drop-zone-active');    		
	    	
			var documentTargetEl = this.getEl();
			if (!documentTargetEl) return;
			
			documentTargetEl.on('click', this.onClick, this);
			if (this.dropActivated) documentTargetEl.on('drop', this.onDrop, this);	
    	},
    	
    	disable : function() {
	    	this.removeCls('drop-zone-active');
	    	this.addCls('drop-zone-inactive');
	    	this.resetTrayContext();
	    	
			var documentTargetEl = this.getEl();
			if (!documentTargetEl) return;
			
			documentTargetEl.un('click', this.onClick, this);
			documentTargetEl.un('drop', this.onDrop, this);    	
    	},
    	
    	afterrender : function() {
	    	this.getEl().unselectable();
    	}
    	
    },
    
    initComponent : function() {

		this.uploadMessage = Ext.window.MessageBox.create({ 
			id: 'uploadMessage',
			closable : false,
			title:'Uploading...',
			msg: 'Please hold while uploading the documents'
		});
		
		this.addEvents({
			click : true
		});
		
		this.dropActivated = ('undefined' != typeof FormData);
		if (!this.dropActivated) {
			Ext.log('FormData does not exist. Drag&Drop of files will not be supported');
		}
		
		this.callParent(arguments);
		
		this.disable();
    	
    },
    
    updateTrayContext : function(trayContextDefinition) {
    	if (!trayContextDefinition) return false;
    	
    	var trayNodeRef = trayContextDefinition.nodeRef;
    	if (!trayNodeRef) return false;
    	
    	this.targetContext = trayContextDefinition;
    	
    	var trayLabel =  trayContextDefinition.label || '';
    	this._updateTrayLabel(trayLabel);
    	
    	return true;
    },
    
    resetTrayContext : function() {
    	
    	this.targetContext = null;
    	this._updateTrayLabel('');
    	
    },
    
    /**
     * @private
     * @param {} trayLabel
     */
    _updateTrayLabel : function(trayLabel) {
		this.update({
			tray : trayLabel || ''
		});    	
    },
        
	onClick : function(event, element) {
		// do nothing by default
		this.fireEvent('click', this, event, element);
	},
	
	onDrop : function(evt) {
		
		// Stop the browser's default behavior when dropping files in the viewable area
		evt.stopPropagation();
		evt.preventDefault();
 
		var files = Yamma.view.windows.DropZone.getDroppedFiles(evt);
		if (!files || files.length == 0) return;
		
		this.uploadDocuments(files);		
	
	},

	/**
	 * TODO: Should be handled with a more abstract and generic manner
	 * @param {} files
	 */
	uploadDocuments : function (/* FileList */ files) {
		
		var me = this;
		
	    var formData = new FormData();
	    for (var i = 0, len = files.length; i < len; i++) {
			formData.append('filedata', files[i]);
	    }
	    formData.append('destination', this.getDestination());
	 
	    
	    var url = Bluexml.Alfresco.resolveAlfrescoProtocol(this.ALFRESCO_UPLOAD_URL);
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', url);
	 
	    
	    // Define any actions to take once the upload is complete
	    xhr.onloadend = me.onLoadEnded;
	 
	    // Start the upload process
	    xhr.send(formData);
	},
	
	getDestination : function() {
		var targetContext = this.targetContext;
		if (!targetContext) return null;
		return targetContext.nodeRef || null;
	},
	
	onLoadEnded : function(evt) {
		
        // Close the upload message box
        if (me.uploadMessage) me.uploadMessage.destroy();
 
        // Show a message containing the result of the upload
        if (evt.target.status === 200) {
            // Tell the user somehow that the upload succeeded
        } else {
            // Tell the user somehow that the upload failed
        }
		
	}
	
});