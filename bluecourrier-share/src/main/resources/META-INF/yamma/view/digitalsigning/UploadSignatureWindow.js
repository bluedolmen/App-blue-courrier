Ext.define('Yamma.view.digitalsigning.UploadSignatureWindow', {

	extend : 'Yamma.view.digitalsigning.UploadFormWindow',
	alias : 'widget.uploadsignaturewindow',
	
	uploadUrl : 'alfresco://bluedolmen/digital-signing/signature',
	
	title : i18n.t('view.digitalsigning.uploadsignature.title'),
	
	height : 230,
	
	errorTitle : i18n.t('view.digitalsigning.uploadsignature.error'),
	errorMessage : '<strong>'+i18n.t('view.digitalsigning.uploadsignature.errormessage.1') +'</strong><br/><br/>' +
		'<ul>' +
		'<li>' + i18n.t('view.digitalsigning.uploadsignature.errormessage.2') +
		'<li>'  + i18n.t('view.digitalsigning.uploadsignature.errormessage.3') +
		'<li>' + i18n.t('view.digitalsigning.uploadsignature.errormessage.4') +
		'</ul>'
	,
	
	// Key field
	keyFieldName : 'key',
	keyFieldLabel : i18n.t('view.digitalsigning.uploadsignature.keyLabel'),
	KeyFieldIconCls : Yamma.Constants.getIconDefinition('page_white_key').iconCls,
	
	// Image field
	imageFieldName : 'image',
	imageFieldLabel : i18n.t('view.digitalsigning.uploadsignature.imageLabel'),
	imageFieldIconCls : Yamma.Constants.getIconDefinition('page_white_camera').iconCls,
	
	// password field
	passwordFieldName : 'password',
	passwordFieldLabel :  i18n.t('view.digitalsigning.uploadsignature.passwordLabel'),
	
	// Key type
	keyTypeFieldName : 'keyType',
	keyTypeFieldLabel :  i18n.t('view.digitalsigning.uploadsignature.keyTypeLabel'),
	defaultKeyTypeValue : 'PKCS12',
	
	getFormFields : function() {
		
		var keyTypes = Ext.create('Ext.data.Store', {
		    fields: ['abbr', 'name'],
		    data : [
		        {"id":"pkcs12", "name":"PKCS12"},
		        {"id":"jks", "name":"JKS"}
		    ]
		});		
		
		return [
  			{
				xtype : 'combo',
				itemId : 'keyType-combo',
				fieldLabel : this.keyTypeFieldLabel,
				name : this.keyTypeFieldName,
			    store: keyTypes,
			    queryMode: 'local',
			    displayField: 'name',
			    valueField: 'id',				
				allowBlank : false,
				value : 'pkcs12'
			},
			{
				xtype : 'filefield',
				emptyText : this.emptyTextLabel,
				fieldLabel : this.keyFieldLabel,
				name : this.keyFieldName,
				buttonText : '',
				allowBlank : false,
				
				buttonConfig : {
					iconCls : this.KeyFieldIconCls
				}
				
			},
			{
				xtype : 'textfield',
				inputType : 'password',
				fieldLabel : this.passwordFieldLabel,
				name : this.passwordFieldName,
				allowBlank : false
			},
			{
				xtype : 'filefield',
				emptyText : this.emptyTextLabel,
				fieldLabel : this.imageFieldLabel,
				name : this.imageFieldName,
				buttonText : '',
				
				buttonConfig : {
					iconCls : this.imageFieldIconCls
				}
				
			}					
		];
				
	}

});
