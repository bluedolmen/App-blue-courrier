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
			},
			{
				/*
				 * This is a fake field to ensure the form will be POST-ed
				 * by using application/x-www-form-urlencoded.
				 * <p>
				 * Indeed there is a bug (regression) in Alfresco 5.0 preventing
				 * from a standard form POST-ed request to pass correctly the
				 * parameters when passing through the Share alfresco proxy.
				 */
				xtype : 'filefield',
				emptyText : this.emptyTextLabel,
				fieldLabel : '&nbsp',
				name : 'fake',
				hidden : true,
				buttonText : ''
			}					
		];
		
	},
	
	getErrorReader : function() {
		return null;
	}
	
});
