Ext.define('Yamma.view.digitalsigning.UploadSignatureWindow', {

	extend : 'Yamma.view.digitalsigning.UploadFormWindow',
	alias : 'widget.uploadsignaturewindow',
	
	uploadUrl : 'alfresco://bluedolmen/digital-signing/signature',
	
	title : "Ajout/Modification d'une signature",
	
	height : 230,
	
	errorTitle : 'Echec',
	errorMessage : '<strong>Echec de la sauvegarde la signature.</strong><br/><br/>' +
		'<ul>' +
		'<li>Veuillez vérifier votre clé (taille, format, cohérence du format avec la déclaration).' +
		'<li>Le mot de passe est obligatoire et protège votre clé privée qui doit rester secrète.' +
		"<li>Enfin, l'image n'est pas obligatoire et peut être modifiée dans un second temps." +
		'</ul>'
	,
	
	// Key field
	keyFieldName : 'key',
	keyFieldLabel : 'Certificat',
	KeyFieldIconCls : Yamma.Constants.getIconDefinition('page_white_key').iconCls,
	
	// Image field
	imageFieldName : 'image',
	imageFieldLabel : 'Image',
	imageFieldIconCls : Yamma.Constants.getIconDefinition('page_white_camera').iconCls,
	
	// password field
	passwordFieldName : 'password',
	passwordFieldLabel : 'Mot de passe',
	
	// Key type
	keyTypeFieldName : 'keyType',
	keyTypeFieldLabel : 'Type',
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
