Ext.define('Yamma.view.digitalsigning.UploadSigningImageWindow', {

	extend : 'Yamma.view.digitalsigning.UploadFormWindow',
	alias : 'widget.uploadsigningimagewindow',
	
	uploadUrl : 'alfresco://bluedolmen/digital-signing/signature/image',
	
	title :  i18n.t('view.digitalsigning.uploadsigningimagewindow.title'),
	
	errorTitle : i18n.t('view.digitalsigning.uploadsigningimagewindow.errorTitle'),
	errorMessage : '<strong>'+ i18n.t('view.digitalsigning.uploadsigningimagewindow.errorMessage'), +'</strong><br/><br/>',
	
	// Image field
	imageFieldName : 'image',
	imageFieldLabel : i18n.t('view.digitalsigning.uploadsigningimagewindow.imageLabel'),
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
