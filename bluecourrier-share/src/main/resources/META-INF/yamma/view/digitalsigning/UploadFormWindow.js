Ext.define('Yamma.view.digitalsigning.UploadFormWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.dsuploadformwindow',
	
	requires : [
		'Ext.form.field.File',
		'Bluedolmen.utils.ExtJSUtils'
	],

	uploadUrl : null,
	
	width : 400,
	height : 400,

	title : i18n.t('view.dialog.digitalsigning.uploadformwindow.title'),
	emptyTextLabel :  i18n.t('view.dialog.digitalsigning.uploadformwindow.emptyTextLabel'),
	waitingMessage :  i18n.t('view.dialog.digitalsigning.uploadformwindow.waiting'),
	
	errorTitle :  i18n.t('view.dialog.digitalsigning.uploadformwindow.errorTitle'),
	errorMessage :  i18n.t('view.dialog.digitalsigning.uploadformwindow.errorMessage'),
	
	submitButtonLabel :  i18n.t('view.dialog.digitalsigning.uploadformwindow.submit'),
	cancelButtonLabel :  i18n.t('view.dialog.digitalsigning.uploadformwindow.cancel'),
	
	layout: {
	    type: 'vbox',
	    align : 'stretch'
	},
	
	initComponent : function() {
		
		this.items = [
			this.getFormDefinition()
		];
		
		this.addEvents('beforeSubmit', "submitSuccess");
		
		this.callParent(arguments);
		
	},
	
	getButtonsDefinition : function() {
		
		return [
			{
				text : this.submitButtonLabel,
				handler : this.onSubmit,
				iconCls : Yamma.Constants.getIconDefinition('disk').iconCls,
				scope : this,
				formBind : true
			},
			{
				text : this.cancelButtonLabel,
				handler : this.onCancel,
				iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
				scope : this
			}
		];
		
	},
	
	getFormDefinition : function() {
		
		var 
			formDefinition = {
				xtype : 'form',
				itemId : 'form-panel',
				bodyPadding: 10,
				defaults : {
					anchor : '100%',
					msgTarget : 'side',
					labelWidth : 80
				},
				items : this.getFormFields(),
				buttons : this.getButtonsDefinition(),
				frame : true,
				style : {
//					border : '0px'
				},
				flex : 1,
				margin : '10px'
			},
			errorReader = this.getErrorReader()
		;
		
		if (null != errorReader) {
			formDefinition.errorReader = errorReader;
		}
		
		return formDefinition;
		
	},
	
	getErrorReader : function() {

		/*
		 * Create a custom error-Reader.
		 * This is made necessary because of the use of the direct proxy between Share
		 * and Alfresco.
		 * The connector suffers from a "bug" which prevents the return of the initial
		 * (potentially customized) error message (code >500 errors). This behavior is
		 * observed notably on version 4.0.2.9 using spring-surf 1.1.0-SNAPSHOT (beware
		 * of looking at the inside of the jar since 1.0.0 name does not actually means
		 * that the 1.0.0 version is really embedded!).
		 * As a workaround, we just analyze the content of the HTML message to identify
		 * a HTTP (code) extract.
		 * As a side effect, the actual error is unknown and a generic message has to be
		 * provided.
		 */
		
		return Ext.create('Ext.data.reader.Reader', {
			
			read : function(response) {
				
				var 
					responseText = response.responseText || '',
					match = null,
					code = 200
				;
				
				// First, suppose a valid json
                result = Ext.decode(response.responseText, true /* safe */);
                
                if (null == result) {
                	match = /.*HTTP (\d+).*/.exec(responseText),
                	code = Number( match && match[1] || "200");
                	result = {
                		success : code >= 200 && code < 300	
                	};
                }	                
				
                return result;
				
			}
		
		});
		
	},
	
	getFormFields : function() {
		
		return [];
		
	},

	onSubmit : function(button, event) {
		
		this.submitForm();
		
	},
	
	onCancel : function(button, event) {
		
		this.close();
		
	},
	
	submitForm : function(config) {
		
		config = config || {};
		
		var
			me = this,
			form = me.queryById('form-panel').getForm()
		;
		if (!form.isValid()) return;
		
		var uploadUrl = this.uploadUrl;
		if (!uploadUrl) {
			Ext.Error.raise('IllegalStateException! The uploadUrl has not been defined');
		}
		
		if (!this.fireEvent('beforeSubmit', form)) return;
		
		form.submit({
			url : Bluedolmen.Alfresco.resolveAlfrescoProtocol(uploadUrl),
			waitMsg : config.waitingMessage || this.waitingMessage,
			success : function onSuccess() {
				
				if (Ext.isFunction(config.onSuccess)) {
					if (false === config.onSuccess.call(config.scope || me.scope || me, arguments)) return;
				}
				
				me.onSuccess.call(me.scope || me, arguments);
				
			},
			failure: function onFailure() {
				
				if (Ext.isFunction(config.onFailure)) {
					if (false === config.onFailure.call(config.scope || me.scope || me, arguments)) return;
				}
				
				me.onFailure.call(me.scope || me, arguments);
				
			}
		});
		
	},
	
	onFailure : function(form) {
		
		Ext.Msg.show({
			title : this.errorTitle,
			msg : this.errorMessage,
			width : 400,
			buttons : Ext.Msg.OK,
			icon : Ext.Msg.ERROR
		});
		
	},
	
	onSuccess : function(form, action) {
		
		if (action) {
			Ext.log('Success', 'Processed file "' + action.result.file + '" on the server');
		}
		
		this.fireEvent('submitSuccess', form, action);
	}
	
});
