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
	    },
	    {
	    	ref : 'serviceCombo',
	    	selector : 'servicecombo'
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
	
	destination : null,
	
	/**
	 * @private
	 * 
	 * @param {Yamma.utils.Context}
	 *            context the new global context
	 */
	onContextChanged : function(context) {
		this.destination = null;
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
			me = this,
			uploadButton = this.getUploadButton(),
			state = null,
			tray = null,
			service = null
		;
		
		if (null != context) {
			state = context.getState();
			tray = context.getTray();
			service = context.getServiceName();
		}
		
		this.service = service;
		
		if (Ext.isString(service) && 'root' != service) {
			this.destination = getServiceTrayDestinationRef();
			uploadButton.enable();
		}
		else if (tray) { // deprecated
			if (!uploadButton.updateTrayContext(tray)) return;
			uploadButton.enable();
		} 
		else if ('pending' == state) {
			uploadButton.enable();
		}
		else {
			uploadButton.resetTrayContext();
			uploadButton.disable();
		}
		
		function getServiceTrayDestinationRef() {
			var
				serviceCombo = me.getServiceCombo(),
				serviceStore = serviceCombo.getStore(),
				serviceDef = serviceStore.getNodeById(service)
			;
			if (null == serviceDef) return null;
			return serviceDef.get('inboxTray');
			
		}
		
	},
	
	/**
	 * Button click-handler.
	 *
	 * @private
	 */
	onUploadClick : function(item) {
		
		var 
			aspects = item.aspects,
			action = item.action
		;
		
		switch(action) {
			
			case 'selectFile':
				this.showSelectFileWindow(aspects);
			break;
			
			case 'uploadFile':
				this.showUploadForm(aspects);
			break;
			
			case 'createForm':
				this.showCreateForm(aspects);
			break;
			
		}		
		
	},
	
	/**
	 *
	 * @param {} typeShort
	 * @private
	 */
	showSelectFileWindow : function(aspects) {
		
		var
			me = this,
			uploadButton = this.getUploadButton(),
			destination = this.destination || uploadButton.getDestination(),
			selectFileWindow = Ext.create('Yamma.view.windows.SelectCMSFileWindow', {
				width : 500,
				height : 500
			}),
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/copy-to')
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
			
			Bluedolmen.Alfresco.jsonPost(
				{
					url : url,
					dataObj : {
						nodeRef : nodeRef,
						destination : destination ? destination : 'service://' + me.service + '/documentLibrary/trays/inbox',			
//						typeShort : Yamma.utils.datasources.Documents.MAIL_QNAME,
						aspects : aspects,
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
	showUploadForm : function(aspects) {
		
		var 
			me = this,
			uploadButton = this.getUploadButton(),
			destination = this.destination || uploadButton.getDestination(),
			additionalFields = [
				{
					name : 'aspects',
					value : (aspects || []).join(',') 
				}			                    
			]
		;
		
		if (destination) {
			additionalFields.push({
				name : 'destination',
				value : destination,
				allowBlank : true
			});
		}
		else {
			additionalFields = additionalFields.concat([
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
				}
			]);
		}
		
		Ext.create('Yamma.view.windows.UploadFormWindow', {
			
			title : 'Choisissez un fichier',
			
			formConfig : {
				additionalFields : additionalFields
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
			me = this,
			uploadButton = this.getUploadButton(),
			destination = this.destination || uploadButton.getDestination()
		;
		
        Ext.define('Yamma.view.windows.CreateFormWindow.Document', {
            extend : 'Bluedolmen.view.forms.window.CreateFormWindow',            

            onSuccess : function() {
				this.callParent(arguments);
            }
             
	    }, function() {
	            
            var createFormWindow = new this();
            createFormWindow.load({
                typeShort : typeShort,
                formConfig : {
                        destination : destination ? destination : '/sites/' + me.service + '/documentLibrary/trays/inbox',
                        itemId : 'cm:content',
                        //itemId : Yamma.utils.datasources.Documents.MAIL_QNAME,
                        formId : 'fill-online',
                        showCancelButton : false,
                        mimeType : 'text/html'
                }
            });
	               
	    });
        
	}

});