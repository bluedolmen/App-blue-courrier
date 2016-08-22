Ext.define('Yamma.view.digitalsigning.GenerateFormWindow', {

	extend : 'Yamma.view.digitalsigning.UploadFormWindow',
	alias : 'widget.generateformwindow',
	
	uploadUrl : 'alfresco://bluedolmen/digital-signing/generate',
	
	height : 180,

	title : i18n.t('view.dialog.digitalsigning.generateform.title'),//"Génération d'un certificat auto-signé",
	
	waitingMessage : i18n.t('view.dialog.digitalsigning.generateform.waitingMessage'),
	errorMessage : i18n.t('view.dialog.digitalsigning.generateform.errorMessage'),
	
	submitButtonLabel :  i18n.t('view.dialog.digitalsigning.generateform.submit'),
	
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
				fieldLabel : i18n.t('view.dialog.digitalsigning.generateform.fields.password'),
				name : 'password',
				allowBlank : false
			},
			{
				xtype : 'numberfield',
				fieldLabel : i18n.t('view.dialog.digitalsigning.generateform.fields.duration'),
				name : 'duration',
				minValue : 1,
				maxValue : 3650,
				value : 365
			},   
			{
				xtype : 'textfield',
				fieldLabel : i18n.t('view.dialog.digitalsigning.generateform.fields.alias'),
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
