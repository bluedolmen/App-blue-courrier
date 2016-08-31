Ext.define('Yamma.view.windows.DropZone', {
    extend: 'Ext.window.Window',
    title: i18n.t('view.window.dropwindow.title'),//'Add Documents',
    modal: true,
    closable: false,
    width: 400,
 
    items: [{
        id: 'DocumentDropZone',
        xtype: 'container',
        height: 100,
        border: false,
        html: '<div id="drop_zone" style="padding:26px 40px;">'+i18n.t('view.window.dropwindow.dropdocs')+'</div>',
        ddGroup: 'documentsDDGroup',
 
        style: { backgroundColor: '#fff', padding: '5px' },
 
        listeners: {
            afterrender: function () {
                var documentDropTargetEl =  this.getEl().dom, me = this, uploadMessage = Ext.window.MessageBox.create({ id: 'uploadMessage' });
 
                // When the user drops files onto the drop zone, capture the file references and immediately upload
                documentDropTargetEl.addEventListener('drop', function (evt) {
                    var files, datasetName;
 
                    // Stop the browser's default behavior when dropping files in the viewable area
                    evt.stopPropagation();
                    evt.preventDefault();
 
                    // Get the name of the selected data set
                    datasetName = 'noNameForNow';
 
                    // A reference to the files selected
                    files = evt.dataTransfer.files;
 
                    // Currently, I have a separate library that holds reusable functions to access our public API
                    DatasetAPI.uploadDocuments(datasetName, files);
 
                }, false);
            }
        }
    },{
        xtype: 'container',
        id: 'documentFileField',
        style: { padding: '5px' },
 
        // Just adding a typical multipart file field here to a container
        html: '<div style="padding:0 0 5px 0;">'+i18n.t('view.window.dropwindow.upload')+'</div> <input id="upload_dataset_document" type="file" name="files" multiple="multiple" style="margin:0 0 0 30px;" />',
        listeners: {
            afterrender: function () {
 
                // This code is, essentially, the same as above
                Ext.get('upload_dataset_document').on('change', function (evt) {
                    var files, datasetName;
 
                    evt.stopPropagation();
                    evt.preventDefault();
 
                    // Get the name of the selected data set
                    datasetName = 'noNameForNow';
 
                    // A reference to the files selected
                    files = evt.target.files;
 
                    DatasetAPI.uploadDocuments(datasetName, files);
                });
            }
        }
    }],
 
    buttons : [{
        text: 'Close',
        iconCls: 'cancel-icon',
        handler: function() {
            this.up('window').close();
        }
    }],
    
	/**
	 *  XHR upload of documents to a dataset
	 */
	uploadDocuments : function (datasetId, files) {
	    var URI,
	        formData = new FormData(),
	        xhr = new XMLHttpRequest();
	 
	    // Append each file to the FormData() object
	    for (var i = 0; i < files.length; i++) {
	        formData.append('file', files[i]);
	    }
	    
	    formData.append('containerId', '');
	 
	 
	    // Define the URI and method to which we are sending the files
	    URI = Britair.Alfresco.resolveAlfrescoProtocol(
	    	'alfresco://api/upload'
	    );
	    xhr.open('POST', URI);
	 
	    // Define any actions to take once the upload is complete
	    xhr.onloadend = function (evt) {
	        console.log(evt.target);
	 
	        // Close the upload message box
	        uploadMessage.destroy();
	 
	        // Show a message containing the result of the upload
	        if (evt.target.status === 200) {
	            // Tell the user somehow that the upload succeeded
	        } else {
	            // Tell the user somehow that the upload failed
	        }
	    };
	 
	    // Start the upload process
	    xhr.send(formData);
	}    
});