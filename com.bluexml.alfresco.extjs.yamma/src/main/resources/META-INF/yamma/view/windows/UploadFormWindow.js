Ext.define('Yamma.view.windows.UploadFormWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.uploadformwindow',
	
	requires : [
		'Yamma.view.windows.UploadFormPanel'
	],
	
	height : 150,
	width : 400,
	layout : 'fit',
	
	uploadFormConfig : {
		title : 'Téléverser un fichier',
		emptyTextLabel : 'Choisissez un fichier',
		waitingMessage : "En cours d'envoi...",
		showSubmitButton : true,
		submitButtonLabel : 'Envoyer',
		showResetButton : false,
		showCancelButton : true,
		cancelButtonLabel : 'Annuler',
		fileFieldLabel : 'Fichier',
		nameFieldLabel : 'Nom'		
	},
	
	constructor : function(config) {
		
		if (config.formConfig) {
			Ext.apply(this.uploadFormConfig, config.formConfig);
			delete config.formConfig; 
		}
		
		this.callParent(arguments);
		
	},
	
	initComponent : function() {
		
		var me = this;
		
		var formConfig = Ext.applyIf({
			
			xtype : 'uploadform',
			preventHeader : true,
			border : false,
			
			onCancel : function() {
				me.close();
			},
			
			onSuccess : function(form, action) {
				me.close();
				me.onSuccess(action.response);
			},
			
			onFailure : function(form, action) {
				me.close();
				var errorMessage = action.response.responseJSON ? action.response.responseJSON.message : 'Erreur inconnue';
				Ext.Msg.alert("Échec de l'envoi du fichier", errorMessage);
			}
						
		}, this.uploadFormConfig);
		
		this.items = [ formConfig ];
		
		this.callParent(arguments);
		
	},
	
	onSuccess : function(response) {
		
		Ext.log('Form response: ' + response);
	}
		
	
});