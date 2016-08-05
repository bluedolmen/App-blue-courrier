Ext.define('Yamma.view.windows.ServiceUploadWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.serviceuploadwindow',
	
	requires : [
		'Yamma.view.windows.UploadFormPanel',
		'Yamma.view.services.ServicesView',
		'Ext.ux.tree.plugin.NodeDisabled',
		'Ext.form.RadioGroup',
		'Yamma.view.windows.UploadFormPanel',
		'Yaecma.view.documents.DocumentsView'
	],
	
	height : 500,
	width : 800,
	
	renderTo : Ext.getBody(),
	
	initialService : null,
	
	pinned : false,
    tools : [
 	    {
 	    	itemId : 'unpin',
 	    	type : 'unpin',
 	    	handler : function(event, target, owner, tool) {
 	    		this.hide();
 	    		owner.child('#pin').show();
 	    		owner.up('panel').pinned = true;
 	    	}
 	    },
 	    {
 	    	itemId : 'pin',
 	    	type : 'pin',
 	    	hidden : true,
 	    	handler : function(event, target, owner, tool) {
 	    		this.hide();
 	    		owner.child('#unpin').show();
 	    		owner.up('panel').pinned = false;
 	    	}
 	    }
	],
	
	initComponent : function() {
		
		var me = this;
		
		this.isUploadReady = this.isLocalUploadReady;
		this.upload = this.localUpload;
		
		this.items = this.getItems();
		
		this.buttons = [
			{
				text : 'Téléverser',
				itemId : 'upload-button',
				iconCls : Yamma.Constants.getIconDefinition('add').iconCls,
				handler : function() {
					me.upload();
				},
				disabled : true,
				scope : this
				
			},
			{
				text : 'Créer',
				itemId : 'create-button',
				iconCls : Yamma.Constants.getIconDefinition('add').iconCls,
				handler : function() {
					me.showCreateForm();
				},
				disabled : true,
				scope : this			
			},
			{
				text : 'Annuler',
				itemId : 'cancel-button',
				iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
	        	handler : function() {
	        		me.close();
	        	},
				scope : this
			}
		];
		
		this.callParent(arguments);

		me.on('show', me.updateButtons, me);

	},
	
	layout : {
		type : 'hbox',
		align : 'stretch'
	},
	
	defaults : {
		padding : 3
	},
	
	getItems : function() {
		
		var
			me = this,
						
			serviceView = {
				xtype : 'servicesview',
				itemId : 'services',
				title : 'Service destination',
				allowDeselect : false,
				headerPosition : 'top',
				initialSelection : this.initialService,
				showDisabled : true,
				viewConfig : {
					toggleOnDblClick : false
				},
				
				storeConfig : {
					
					showMembership : true,
					
					disabledConvertFunction : function(value, record) {
						
						if (false === value) return false; // called when trying to force value on root 
						
						var 
							membership = record.get('membership'),
							role = null
						;
						if (membership) {
							for (role in membership) {
								if (true === membership[role]) return false;
							}
						}
						
						return true;
						
					}	
					
				},
				
				listeners : {
					
					'load' : function selectParentService() {

						// TODO : should assign the prefered service
						
					},
					
					'selectionchange' : function() {
						me.updateButtons();
					},
					
					scope : me
					
				},
				flex : 1,
				border : 1
			},
			
			mailType = {
				layout : 'fit',
				height : '30px',
				margin : '3 0 0 0',
				items : [{
			        xtype: 'radiogroup',
			        itemId : 'mail-type',
			        fieldLabel: 'Type',
			        columns: 2,
			        defaults : {
			        	padding : 5
			        },
			        items: [
			            { boxLabel: 'Entrant', name: 'type', inputValue: 'incoming' },
			            { boxLabel: 'Sortant', name: 'type', inputValue: 'outgoing', checked : true}
			        ],
					listeners : {
						'change' : me.updateButtons,
						scope : me
					}
				}],
		    },
		    
		    uploadFormPanel = Ext.create('Yamma.view.windows.UploadFormPanel', {
		    	itemId : 'local-upload',
		    	
		    	title : 'Local',
		    	emptyTextLabel : 'Choisissez un fichier',
		    	waitingMessage : 'Téléversement en cours...',
		    	nameFieldLabel : 'Nom',
		    	fileFieldLabel : 'Fichier',
		    	
		    	showSubmitButton : false,
		    	showResetButton : false,
		    	showCancelButton : false,
				additionalFields : [
					{
						name : 'aspects',
						value : '' 
					},
					{
						name : 'destination',
						value : '',
						allowBlank : true
					}
				]
		    }),
		    
			uploadForm = uploadFormPanel.getForm(),
			fileField = uploadForm.findField(uploadFormPanel.fileFieldName)
		    
		;

		fileField.on('change', me.updateButtons, this);
		
		return [
		        
		       	{
		       		xtype : 'container',
					layout : {
						type : 'vbox',
						align : 'stretch',
					},
					border : 1,
					flex : 2,
		       		items : [
		       		    serviceView,
		       			mailType
		       		]
		       	},
		       	{
		       		xtype : 'tabpanel',
		       		layout : 'fit',
		       		flex : 3,
		       		border : false,
		       		defaults : {
		       			border : false
		       		},
		       		items : [
		       		    uploadFormPanel,
		       		    {
		       		    	title : 'Serveur',
		       		    	layout : {
		       		    		type : 'vbox',
		       		    		align : 'stretch'
		       		    	},
		       		    	plain : true,
		       		    	items : [
		       		    	         
								Ext.create('Yaecma.view.documents.DocumentsView', {
									itemId : 'remote-upload',
									title : false,
									rootRef : 'st:sites',
									// TODO: smarter integration
									tbar : [
										{
											xtype : 'button',
											scale : 'small',
											text : '',
											iconCls : Yaecma.Constants.getIconDefinition('folder_up').iconCls,
											id : 'backToParent'
										},
										{
											xtype : 'parentsmenu',
											text : ' ',
											iconCls : Yaecma.Constants.getIconDefinition('folder').iconCls,
											id : 'backToAncestor'
										},
										'->',
										{
											xtype : 'checkbox',
											itemId : 'move-checkbox',
											boxLabel : "Déplacer",
											boxLabelAlign : 'after',
											checked : false
										},    	         
										'->',
										{
											xtype : 'sortersmenu',
											id : 'sortBy'
										}
									],
									
									flex : 1,
									listeners : {
										'selectionchange' : function() {
											me.updateButtons();
										}
									}
									
								})								
							]
		       		    }
					],
					
					listeners : {
						
						'tabchange' : function(tabPanel, newCard, oldCard, eOpts) {
							
							var remotePanel = newCard.queryById('remote-upload');
							me.isUploadReady = null == remotePanel ? me.isLocalUploadReady : me.isRemoteUploadReady;
							me.upload = null == remotePanel ? me.localUpload : me.remoteUpload;
							
							me.updateButtons();
							
						}
		       		
					}
		       	}
		];
		
	},
	
	isLocalUploadReady : function() {
		
		var
			uploadFormPanel = this.queryById('local-upload'),
			form = uploadFormPanel.getForm(),
			fileField = form.findField(uploadFormPanel.fileFieldName)
		;
		if (!fileField) return false;
		
		return !!fileField.getValue();
			
	},
	
	localUpload : function() {
		
		var
			me = this,
			mailType  = this.getMailType(),
			aspects = mailType.aspects,
			destination = this.getDestination(),
			uploadFormPanel = this.queryById('local-upload'),
			form = uploadFormPanel.getForm(),
			aspectsField = form.findField('aspects'),
			destinationField = form.findField('destination')
		;
		
		aspectsField.setValue((aspects || []).join(','));
		destinationField.setValue(destination);
		
		this.setLoading(true);
		uploadFormPanel.submitForm({
			onSuccess : function onSucess() {
				form.reset();
				me.onSuccess(arguments);
			},
			onFailure : me.onFailure,
			scope : me
		});
		
	},
	
	isRemoteUploadReady : function() {
		
		return null != this.getRemoteUploadSelectedFile();
		
	},
	
	getRemoteUploadSelectedFile : function() {
		
		var
			uploadFormPanel = this.queryById('remote-upload'),
			selectionModel = uploadFormPanel.getSelectionModel(),
			selection = selectionModel.getSelection()
		;
		
		if (null == selection) return null;
		var firstSelected = selection[0];
		if (null == firstSelected) return null;
		
		var isContainer = firstSelected.get('isContainer');
		return isContainer ? null : firstSelected;
		
	},
	
	remoteUpload : function() {
		
		var
			me = this,
			selectedFile = this.getRemoteUploadSelectedFile(),
			nodeRef = selectedFile.get('nodeRef'),
			mailType  = this.getMailType(),
			aspects = mailType.aspects,
			destination = this.getDestination(),
			moveCheckBox = this.queryById('move-checkbox'),
			operation = moveCheckBox.getValue() ? 'move' : 'copy',
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol('alfresco://bluedolmen/yamma/copy-to')
		;
				
		this.setLoading(true);
		
		Bluedolmen.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : nodeRef,
					destination : destination,			
					aspects : aspects,
					operation : operation
//					filename : fileName
				},
				onSuccess : me.onSuccess,
				onFailure : me.onFailure,
				scope : this
			}
		);	

	},
	
	/**
	 *
	 * @param {} typeShort
	 * @private
	 */
	showCreateForm : function() {
		
		var
			me = this,
			mailType  = this.getMailType(),
			aspects = mailType.aspects,			
			destination = this.getDestination()
		;
		
      Ext.define('Yamma.view.windows.CreateFormWindow.Document', {
          extend : 'Bluedolmen.view.forms.window.CreateFormWindow',            

          onSuccess : function() {
				this.callParent(arguments);
				me.onSuccess();
          }
           
	    }, function() {
	            
          var createFormWindow = new this();
          createFormWindow.load({
              typeShort : aspects,
              formConfig : {
                      destination : destination,
                      itemId : 'cm:content',
                      formId : 'fill-online',
                      showCancelButton : false,
                      mimeType : 'text/html'
              }
          });
	               
	    });
      
	},	
		
	getDestination : function() {
		
		var
			servicesView = this.queryById('services'),
			serviceNode = servicesView.getSelectedServiceNode()
		;	
		if (null == serviceNode) return null;
		if (serviceNode.get('disabled')) return null;
		
		return serviceNode.get('inboxTray');
		
	},
	
	getMailType : function() {
		
		var 
			mailType = this.queryById('mail-type'),
			value = mailType.getValue()
		;
		
		return 'incoming' == value.type ? 				
			Yamma.Constants.INBOUND_MAIL_TYPE_DEFINITION :
			Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION
		;

		
	},
	
	updateButtons : function() {
		
		var
			uploadButton = this.queryById('upload-button'),
			createButton = this.queryById('create-button'),
			destination = this.getDestination(),
			mailType = this.getMailType()
		;
		
		uploadButton.setDisabled(!(null != destination && this.isUploadReady()));
		createButton.setDisabled(null == destination || Yamma.Constants.OUTBOUND_MAIL_TYPE_DEFINITION == mailType);
		
	},
	
	onSuccess : function(response) {
		
		this.setLoading(false);
		
		var nodes = response ? response.nodes : null;
		if (null != nodes) {
			this.fireEvent('success', nodes);
		}

		this.closeIfNotPinned();
		
	},
	
	onFailure : function(response) {
		
		this.setLoading(false);
		
		Bluedolmen.Alfresco.genericFailureManager(response);
		this.closeIfNotPinned();
		
	},
	
	closeIfNotPinned : function() {
		
		if (this.pinned) return;
		this.close();
		
	},
	
	close : function() {
		
		this.callParent(arguments);
		
	}	

		
	
});