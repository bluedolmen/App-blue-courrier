Ext.define('Yamma.view.digitalsigning.GenerateFormWindow', {

	extend : 'Yamma.view.digitalsigning.UploadFormWindow',
	alias : 'widget.generateformwindow',
	
	uploadUrl : 'alfresco://bluedolmen/digital-signing/generate',
	
	height : 180,

	title : "Génération d'un certificat auto-signé",
	
	waitingMessage : 'Génération en cours...',
	errorMessage : '<strong>Echec de la génération du certificat auto-signé.</strong><br/><br/>',
	
	submitButtonLabel : 'Générer',
	
	iconCls : Yamma.Constants.getIconDefinition('cog_rosette').iconCls, 
	
	layout: {
	    type: 'vbox',
	    align : 'stretch'
	},	
	
	getFormFields : function() {
		
		return [
			{
				xtype : 'textfield',
				inputType : 'password',
				fieldLabel : 'Mot de passe',
				name : 'password',
				allowBlank : false
			},
			{
				xtype : 'numberfield',
				fieldLabel : 'Durée (jours)',
				name : 'duration',
				minValue : 1,
				maxValue : 3650,
				value : 365
			},   
			{
				xtype : 'textfield',
				fieldLabel : 'Alias',
				name : 'alias'
			}
		];
		
	},
	
	getErrorReader : function() {
		return null;
	}
	
});
