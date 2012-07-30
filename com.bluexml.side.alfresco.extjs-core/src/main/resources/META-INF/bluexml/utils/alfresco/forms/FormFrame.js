Ext.define('Bluexml.utils.alfresco.forms.FormFrame', {

	extend : 'Ext.ux.ManagedIframe.Component',
	alias : 'widget.formframe',
	
	resetUrl : null,
	preloadForm : false,
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'extjsform',
	
	formConfig : {
		
		itemKind : null,
		itemId : null,
		mode : null,
		submitType : null,
		showCaption : true,
		showCancelButton : null,
		editInline : null,
		googleEditable : null,
		
		mimeType : null,
		destination : null,
		redirect : '/share/page/formresult',
		formId : null,
		css : null,
		js : null,
		
		site : null
		
	},
	
	constructor : function(config) {

		config = Ext.apply({}, config); // copy config
		
		var formConfig = Ext.apply({}, this.defaultFormConfig, this.formConfig);
		
		Ext.apply(
			formConfig,
			config.formConfig
		);

		config.formConfig = formConfig;
		
		this.callParent([config]);
	},	
	
	initComponent : function() {
		
		var me = this;
		setEventConfiguration();
		if (true === this.preloadForm) this.load();
		this.callParent();
		
		function setEventConfiguration() {
			
			me.addEvents('formaction');
			me.on('documentloaded', me.onDocumentLoaded);
			me.on('destroy', onDestroy);
			Ext.EventManager.addListener(window, 'message', me.onReceivedMessage, me);
			
		}
		
		function onDestroy() {
			Ext.EventManager.removeListener(window, 'message', me.onReceivedMessage, me);
		}
		
	},
	
	load : function() {
		
		var url = this.getCheckedUrl();		
		this.setSrc(url);
				
	},
	
	getCheckedUrl : function() {
		this.checkMandatoryParameters();
		
		var formConfig = this.getFormConfig();
		
		var cleanedFormConfig = {};
		// Get a formConfig object removing null values
		Ext.Object.each(formConfig, function(key, value, myself) {
			if (null == value) return;
			cleanedFormConfig[key] = value;
		});
		
		var parameters = Ext.Object.toQueryString(cleanedFormConfig);
		var url = this.getSourceUrl() + '?' + parameters;
		
		return url; // no checking here
	},
	
	checkMandatoryParameters : function() {
		
		var formConfig = this.getFormConfig();
		var itemId = formConfig.itemId;
		if (!itemId) {
			Ext.Error.raise('IllegalStateException! No item id is defined');
		}
		
	},
			
	getSourceUrl : function() {
		return this.sourceUrl;
	},
	
	getFormConfig : function() {
		return this.formConfig;
	},
	
	/*
	 * The following material is related to management of the IFrame content
	 * to provide an interaction with the parent (ie current) environment.
	 */
	
	onDocumentLoaded : function(component, frameElement) {		
		// DO NOTHING by default
	},
	
	/**
	 * @protected
	 * @param {Ext.EventObject} event The event as wrapped by Ext-JS
	 */
	getMessageEventDescription : function(event) {
		
		if (!event) return null;
		
		var browserEvent = event.browserEvent;
		if (!browserEvent) return null;
		
		var data = browserEvent.data;
		if (Ext.isString(data)) {
			// Try to decode the string to an Object
			try {
				data = Ext.JSON.decode(data); // generate an exception if not valid...
			} catch (e) {
				Ext.log(Ext.String.format('The received message \'{0}\' is not a valid JSON String', data));
				return null;
			}
		} else {
			data = Ext.apply({}, data); // clone
		}
		
		var eventType = data.eventType;
		if (!eventType) return null;
		
		delete data.eventType;
		return {
			eventType : eventType,
			data : data
		}
	},
	
	onReceivedMessage : function(event) {
		
		var eventDescription = this.getMessageEventDescription(event);
		if (!eventDescription) return;
		
		var eventType = eventDescription.eventType;
		var data = eventDescription.data;
		
		switch(eventType) {
			
			case 'button-click':
				this.onButtonClick(data);
				break;
				
			case 'form-result':
				this.onFormResult(data);
				break;				
				
			default:
				this.onFormAction(eventType, data);
				
		}
		
	},
	
	onButtonClick : function(data) {
		
		var buttonId = data.buttonId;
		if (!buttonId) return;
		
		var handlerImplicitName = 'onContentDocument' + Ext.String.capitalize(buttonId) + 'ButtonClicked';
		var handler = this[handlerImplicitName];
		if (!Ext.isFunction(handler)) return;
		
		handler.call(this, data);
		
	},
	
	/*
	 * Generic form-action
	 */
	onFormAction : function(actionName, data) {
		
		this.fireEvent('formaction', actionName, data);
		
	},	
	
	onFormResult : function(data) {
		
		var state = data.state;
		var message = data.message;
		this.fireEvent('formaction', state, message);
		
	},
		
	onContentDocumentCancelButtonClicked : function(data) {
		
		this.fireEvent('formaction', 'cancel', this);
		
	},
	
	onContentDocumentSubmitButtonClicked : function(data) {
		
		this.fireEvent('formaction', 'submit', this);
		
	}
	
	
});