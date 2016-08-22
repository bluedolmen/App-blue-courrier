Ext.define('Yamma.view.digitalsigning.SignatureManagementWindow', {
	
	extend : 'Ext.window.Window',
	
	uses : [
		'Yamma.view.digitalsigning.SignatureDisplayBox',
		'Yamma.view.digitalsigning.UploadSignatureWindow'
	],
	
	title : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.title'),
	
	width : 500,
	height : 320,
	modal : true,
	
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
    iconCls : Yamma.Constants.getIconDefinition('text_signature').iconCls,
    
	defaults : {
		width : '100%',
		padding : 4
	},
	
	initComponent : function() {
		
		var me = this;
		
		this.setLoading(true);
		
		this.items = [
			{
				xtype : 'signaturedisplaybox',
				itemId : 'signature-box',
				signatureMissingMessage : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.items.signature-box.missingmessage'),,
				listeners : {
					'load' : function() {
						me._updateButtons();
						me.setLoading(false);
					}
				}
			}
		];
		
		this.dockedItems = [
			{
			    xtype: 'toolbar',
			    dock: 'top',
			    items: [
		    		{
		    			xtype : 'button',
		    			text : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.text'),
		    			itemId : 'menu',
		    			menu : {
		    				plain : true,
			    			items : [
	    			    		{
	    			    			itemId : 'generate-button',
	    			    			text : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.generate-button.text'),
	    			    			tooltip : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.generate-button.tooltip'),
	    			    			iconCls : Yamma.Constants.getIconDefinition('cog_rosette').iconCls,
	    			    			operation : 'generate',
	    			    			disabled : true,
	    			    			handler : this._onGenerate,
	    			    			scope : this
	    			    		},
	    			    		{
	    			    			itemId : 'add-button',
	    			    			text : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.add-button.text'),
                                    tooltip : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.add-button.tooltip'),
	    			    			iconCls : Yamma.Constants.getIconDefinition('add').iconCls,
	    			    			operation : 'add',
	    			    			disabled : true,
	    			    			handler : this._onAdd,
	    			    			scope : this
	    			    		},
	    			    		{
	    			    			itemId : 'remove-button',
	    			    			text : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.remove-button.text'),
                                    tooltip : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.remove-button.tooltip'),
	    			    			iconCls : Yamma.Constants.getIconDefinition('delete').iconCls,
	    			    			operation : 'remove',
	    			    			disabled : true,
	    			    			handler : this._onRemove,
	    			    			scope : this
	    			    		},
	    			    		{
	    			    			itemId : 'editImage-button',
	    			    			text : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.editImage-button.text'),
                                    tooltip : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.dockedItems.items.menu.items.editImage-button.tooltip'),
	    			    			iconCls : Yamma.Constants.getIconDefinition('camera_edit').iconCls,
	    			    			operation : 'edit_image',
	    			    			disabled : true,
	    			    			handler : this._onEdit,
	    			    			scope : this
	    			    		}		    			         
							]	    				
		    			}
		    		}
			    ]
			}
		];
		
		this.callParent();		
		
	},
	
	
	_updateButtons : function() {
		
		var
			signatureBox = this.queryById('signature-box'),
			signatureMissing = signatureBox.signatureMissing
		;
		
		this.queryById('add-button').setDisabled(false);
		this.queryById('generate-button').setDisabled(false);
		this.queryById('editImage-button').setDisabled(signatureMissing);
		this.queryById('remove-button').setDisabled(signatureMissing);
		
	},
	
	_onAdd : function() {
		
		var
			me = this,
			window = Ext.create('Yamma.view.digitalsigning.UploadSignatureWindow', {
				modal : true,
				listeners : {
					'submitSuccess' : function() {
						me.setLoading(true);
						me.queryById('signature-box').load();
						window.close();
					}
				}
			})
		;
		
		window.show();
		
	},
	
	SIGNATURE_URL : 'alfresco://bluedolmen/digital-signing/signature',
	
	_onRemove : function() {
		
		var
			me = this,
			url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(this.SIGNATURE_URL)
		;

		me.setLoading(true);
		
		Ext.Ajax.request({
			url : url,
			method : 'DELETE',
			success : function(response) {
				me.queryById('signature-box').load();
			},
			failure : function(response) {
				me.setLoading(false);
				Bluedolmen.Alfresco.genericFailureManager.call(this, response);
			}
		});		
		
	},
	
	_onGenerate : function() {
		
		var 
			me = this,
			window = Ext.create('Yamma.view.digitalsigning.GenerateFormWindow', {
				
				modal : true,
				listeners : {
					'submitSuccess' : function() {
						me.setLoading(true);
						me.queryById('signature-box').load();
						window.close();
					}
				}
				
			})
		;
		
		window.show();
		
	},
	
	_onEdit : function() {
		
		var 
			me = this,
			window = Ext.create('Yamma.view.digitalsigning.UploadFormWindow', {
			
				modal : true,
				uploadUrl : 'alfresco://bluedolmen/digital-signing/signature/image',
				
				title : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.uploadformwindow.title'),
				
				errorTitle : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.uploadformwindow.errorTitle'),
				errorMessage : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.uploadformwindow.errorMessage'),
				
				height : 150,
				
				getFormFields : function() {
					
					return [
						{
							xtype : 'filefield',
							emptyText : this.emptyTextLabel,
							fieldLabel : i18n.t('view.dialog.digitalsigning.signaturemanagementwindow.uploadformwindow.fields.image'),
							name : 'image',
							buttonText : '',
							
							buttonConfig : {
								iconCls : Yamma.Constants.getIconDefinition('page_white_camera').iconCls
							}
						}					
					];
							
				},
				
				listeners : {
					'submitSuccess' : function() {
						me.setLoading(true);
						me.queryById('signature-box').load();
						window.close();
					}
				}
				
			}
		);
		
		window.show();
		
	}
	
});