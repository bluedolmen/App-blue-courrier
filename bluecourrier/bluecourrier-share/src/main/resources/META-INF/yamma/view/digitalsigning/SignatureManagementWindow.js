Ext.define('Yamma.view.digitalsigning.SignatureManagementWindow', {
	
	extend : 'Ext.window.Window',
	
	uses : [
		'Yamma.view.digitalsigning.SignatureDisplayBox',
		'Yamma.view.digitalsigning.UploadSignatureWindow'
	],
	
	title : 'Gestion de la signature électronique',
	
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
				signatureMissingMessage : 
					"<strong>Pas encore de signature.</strong><br/> " +
					"Vous pouvez ajouter, ou générer une signature électronique. " +
					"L'image associée à la signature peut être ajoutée et modifiée avec l'action d'édition." +
					"<br/><br/>" +
					"<em>Note: La génération d'une signature crée uniquement un certificat auto-signé qui n'a aucune valeur légale !</em>"
				,
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
		    			text : 'Menu',
		    			itemId : 'menu',
		    			menu : {
		    				plain : true,
			    			items : [
	    			    		{
	    			    			itemId : 'generate-button',
	    			    			text : 'Générer',
	    			    			tooltip : 'Générer un certificat auto-signé',
	    			    			iconCls : Yamma.Constants.getIconDefinition('cog_rosette').iconCls,
	    			    			operation : 'generate',
	    			    			disabled : true,
	    			    			handler : this._onGenerate,
	    			    			scope : this
	    			    		},
	    			    		{
	    			    			itemId : 'add-button',
	    			    			text : 'Ajouter',
	    			    			tooltip : 'Ajouter un certificat pour la signature électronique',
	    			    			iconCls : Yamma.Constants.getIconDefinition('add').iconCls,
	    			    			operation : 'add',
	    			    			disabled : true,
	    			    			handler : this._onAdd,
	    			    			scope : this
	    			    		},
	    			    		{
	    			    			itemId : 'remove-button',
	    			    			text : 'Supprimer',
	    			    			tooltip : 'Supprimer la signature actuelle',
	    			    			iconCls : Yamma.Constants.getIconDefinition('delete').iconCls,
	    			    			operation : 'remove',
	    			    			disabled : true,
	    			    			handler : this._onRemove,
	    			    			scope : this
	    			    		},
	    			    		{
	    			    			itemId : 'editImage-button',
	    			    			text : 'Modifier l\'image',
	    			    			tooltip : 'Editer l\'image de signature',
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
				
				title : "Ajout/Modification d'une image",
				
				errorTitle : 'Echec',
				errorMessage : '<strong>Echec de la sauvegarde de l\'image.</strong><br/><br/>',
				
				height : 150,
				
				getFormFields : function() {
					
					return [
						{
							xtype : 'filefield',
							emptyText : this.emptyTextLabel,
							fieldLabel : 'Image',
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