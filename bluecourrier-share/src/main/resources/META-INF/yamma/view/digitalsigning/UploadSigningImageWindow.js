Ext.define('Yamma.view.digitalsigning.UploadSigningImageWindow', {

	extend : 'Yamma.view.digitalsigning.UploadFormWindow',
	alias : 'widget.uploadsigningimagewindow',
	
	uploadUrl : 'alfresco://bluedolmen/digital-signing/signature/image',
	
	title : "Ajout/Modification d'une image",
	
	errorTitle : 'Echec',
	errorMessage : '<strong>Echec de la sauvegarde de l\'image.</strong><br/><br/>',
	
	// Image field
	imageFieldName : 'image',
	imageFieldLabel : 'Image',
	imageFieldIconCls : Yamma.Constants.getIconDefinition('page_white_camera').iconCls,
	
	getFormFields : function() {
		
		return [
			{
				xtype : 'filefield',
				emptyText : this.emptyTextLabel,
				fieldLabel : this.imageFieldLabel,
				name : this.imageFieldName,
				buttonText : '',
				allowBlank : false,
				
				buttonConfig : {
					iconCls : this.imageFieldIconCls
				}
				
			}					
		];
				
	}

});
