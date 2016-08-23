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
		title : i18n.t('view.window.uploadformwindow.config.title'),//'Téléverser un fichier',
		emptyTextLabel : i18n.t('view.window.uploadformwindow.config.empty'),//'Choisissez un fichier',
		waitingMessage : i18n.t('view.window.uploadformwindow.config.waiting'),//"En cours d'envoi...",
		showSubmitButton : true,
		submitButtonLabel : i18n.t('view.window.uploadformwindow.config.submit'),//'Envoyer',
		showResetButton : false,
		showCancelButton : true,
		cancelButtonLabel : i18n.t('view.window.uploadformwindow.config.cancel'),//'Annuler',
		fileFieldLabel : i18n.t('view.window.uploadformwindow.config.filefield'),//'Fichier',
		nameFieldLabel : i18n.t('view.window.uploadformwindow.config.namefield'),//'Nom'
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
				
				if (Ext.isFunction(me.onSuccess)) {
					if (false === me.onFailure(action.response)) return;
				}
				
				var 
					errorMessage = ( 
						action.result.errors[0] ||
						{
							message : action.response.responseJSON ? action.response.responseJSON.message : 'Erreur inconnue'
						}
					).message,
					htmlMessage = errorMessage.replace(/\n/g,'<br>')
				;
					
				Ext.MessageBox.show({
					title : i18n.t('view.window.uploadformwindow.errors.failed'),//"Échec de l'envoi du fichier",
					msg : htmlMessage,
					icon : Ext.MessageBox.ERROR,
					buttons: Ext.MessageBox.OK
				});
				
			}
						
		}, this.uploadFormConfig);
		
		this.items = [ formConfig ];
		
		this.callParent(arguments);
		
	},
	
	onSuccess : Ext.emptyFn,
	
	onFailure : Ext.emptyFn
		
	
});