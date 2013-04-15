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
	
	requires : [
		'Yamma.view.windows.SelectCMSFileWindow'
	],	
	
	uses : [
		'Yamma.view.windows.UploadFormWindow'
	],

	refs : [
	
	    {
			ref : 'uploadButton',
	    	selector : 'uploadbutton'
	    }	    
	    
	],
	
	service : null,
	
	init: function() {
		
		this.application.on({
			contextChanged : this.onContextChanged,
			scope : this
		});
		
		this.control({
			'uploadbutton menuitem': {
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
			state = context.getState(),
			tray = context.getTray(),
			service = context.getService()
		;
		
		this.service = service ? service.serviceName : null;
			
		if (tray) {
			if (!uploadButton.updateTrayContext(tray)) return;
			uploadButton.enable();
		} else if ('pending' == state) {
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
	onUploadClick : function(item) {
		
		var 
			typeShort = item.typeShort,
			action = item.action
		;
		
		switch(action) {
			
			case 'selectFile':
				this.showSelectFileWindow(typeShort);
			break;
			
			case 'uploadFile':
				this.showUploadForm(typeShort);
			break;
			
			case 'createForm':
				this.showCreateForm(typeShort);
			break;
			
		}		
		
	},
	
	/**
	 *
	 * @param {} typeShort
	 * @private
	 */
	showSelectFileWindow : function(typeShort) {
		
		var
			me = this,
			uploadButton = this.getUploadButton(),
			destination = uploadButton.getDestination(),
			selectFileWindow = Ext.create('Yamma.view.windows.SelectCMSFileWindow', {
				width : 500,
				height : 500
			}),
			url = Bluexml.Alfresco.resolveAlfrescoProtocol('alfresco://bluexml/yamma/copy-to')
		;
		
		selectFileWindow.mon(selectFileWindow, 'fileselected', function(nodeRef, record) {
			
			var
				operation = selectFileWindow.getOperation(),
				fileName = selectFileWindow.getFileName()
			;
			
			function onSuccess(jsonResponse) {
				
				var nodes = jsonResponse.nodes;
				if (null != nodes) {
					me.application.fireEvent('newDocumentAvailable', nodes);
				}
				
				selectFileWindow.close();
	
			}
			
			function onFailure() {
				selectFileWindow.close();
			}
			
			selectFileWindow.setLoading(true);
			
			Bluexml.Alfresco.jsonPost(
				{
					url : url,
					dataObj : {
						nodeRef : nodeRef,
						destination : destination ? destination : 'service://' + me.service + '/documentLibrary/trays/inbox',			
						typeShort : typeShort,
						operation : operation,
						filename : fileName
					},
					onSuccess : onSuccess,
					onFailure : onFailure
				}
			);	

			return false; // do not close the window yet
		});

		selectFileWindow.show();
		
	},
	
	/**
	 * Displays an upload form to the current destination.
	 * 
	 * @private
	 */
	showUploadForm : function(typeShort) {
		
		var 
			me = this,
			uploadButton = this.getUploadButton()
		;
		
		Ext.create('Yamma.view.windows.UploadFormWindow', {
			
			title : 'Choisissez un fichier',
			
			formConfig : {
				additionalFields : [
					{
						name : 'destination',
						value : uploadButton.getDestination(),
						allowBlank : true
					},
					{
						name : 'siteid',
						value : me.service,
						allowBlank : true
					},
					{
						name : 'containerid',
						value : 'documentLibrary',
						allowBlank : true
					},
					{
						name : 'uploaddirectory',
						value : 'trays/inbox',
						allowBlank : true
					},
					{
						name : 'contentType',
						value : typeShort
					}
				]
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
		
	},
	
	/**
	 *
	 * @param {} typeShort
	 * @private
	 */
	showCreateForm : function(typeShort) {
		var
			uploadButton = this.getUploadButton(),
			destination = uploadButton.getDestination()
		;
		
        Ext.define('Yamma.view.windows.CreateFormWindow.Document', {
            extend : 'Bluexml.view.forms.window.CreateFormWindow',            

            onSuccess : function() {
				this.callParent(arguments);
            }
             
	    }, function() {
	            
            var createFormWindow = new this();
            createFormWindow.load({
                typeShort : typeShort,
                formConfig : {
                        destination : destination,
                        itemId : typeShort,
                        formId : 'fill-online',
                        showCancelButton : false,
                        mimeType : 'text/html'
                }
            });
	               
	    });
        
	}

});