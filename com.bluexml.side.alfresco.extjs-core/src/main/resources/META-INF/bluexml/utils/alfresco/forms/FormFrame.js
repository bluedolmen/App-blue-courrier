Ext.define('Bluexml.utils.alfresco.forms.FormFrame', {

	extend : 'Ext.ux.ManagedIframe.Component',
	alias : 'widget.formframe',
	
	autoLoad : false,
	
	sourceUrl : Alfresco.constants.URL_PAGECONTEXT + 'standaloneform',
	
	formConfig : {
		
		itemKind : 'node',
		itemId : null,
		mode : null,
		submitType : null,
		showCaption : true,
		showCancelButton : true,
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
		if (this.autoLoad) this.load();
		this.callParent();
		
		function setEventConfiguration() {
			
			me.enableBubble('formaction');
			me.addEvents('formaction');
			me.on('documentloaded', me.onDocumentLoaded);
			
		}
		
	},
	
	load : function() {
		
		var url = this.getCheckedUrl();		
		this.setSrc(url);
				
	},
	
	getCheckedUrl : function() {
		this.checkMandatoryParameters();
		
		var formConfig = this.getFormConfig();
		var parameters = Ext.Object.toQueryString(formConfig);
		var url = this.getSourceUrl() + '?' + parameters;
		
		return url; // no checking here
	},
	
	checkMandatoryParameters : function() {
		
		var formConfig = this.getFormConfig();
		var itemId = formConfig.itemId;
		if (!itemId) { // TODO: mandatory arguments should be checked generically
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
	
	getContentDocument : function() {
		var frameElement = this.getContentTarget();
		if (null == frameElement) return null;
		
		var contentDocument = frameElement.dom.contentDocument;
		return contentDocument;
	},
	
	onDocumentLoaded : function(component, frameElement) {
		var contentDocument = frameElement.dom.contentDocument;

		this.registerButtonClickEvents(contentDocument);
		this.bindYahooCustomEvent(contentDocument);
		
	},
	
	/**
	 * Registers the click event on button themselves for submit/cancel actions.
	 * A click listener is also added on the document, but submit/cancel events
	 * are not plugged by default. Indeed a side effect could arrise if a
	 * subform is loaded in the main document.
	 * <p>
	 * The user is free to manage a specific behavior case-by-case
	 */
	registerButtonClickEvents : function(contentDocument) {
		
		var me = this;
		contentDocument = contentDocument || this.getContentDocument();
		
		Ext.EventManager.addListener(
			contentDocument, 
			'click',
			Ext.Function.bind(this.onContentDocumentClicked, this)
		);

		var body = Ext.get(contentDocument.body); // Returns an Ext.Element
		if (!body) return;
		
		var buttons = body.query('button');
		Ext.Array.forEach(buttons, function(button) {
			
			var buttonId = button.id;
			if (undefined === buttonId) return;

			if (buttonId.indexOf('cancel-button') > 0) {
				registerButtonClickedEvent(button, me.onContentDocumentCancelButtonClicked);
			} 
			else if (buttonId.indexOf('submit-button') > 0) {
				registerButtonClickedEvent(button, me.onContentDocumentSubmitButtonClicked);			
			}
			
		});
		
		function registerButtonClickedEvent(button, callback) {
			
			Ext.EventManager.addListener(
				button, 
				'click',
				Ext.Function.bind(callback, me)
			);
			
		}
	},
	
	bindYahooCustomEvent : function(contentDocument) {
		
		var me = this;
		contentDocument = contentDocument || this.getContentDocument();
		
		var onFormAction = contentDocument.onformaction;
		if (!onFormAction || !onFormAction.subscribe) return;			
			
		onFormAction.subscribe(
			function callOnFormAction(eventName, args) {
				me.onFormAction.apply(me, args);
			},
			this
		);			
		
	},
	
	onFormAction : function(actionName, data) {
		
		this.fireEvent('formaction', actionName, data);
		
	},
	
	onContentDocumentClicked : function(event, htmlElement, eOpts) {
		
		if ('button' === htmlElement.type) {
			var buttonId = htmlElement.id;
			this.onContentDocumentButtonClicked(event, htmlElement, buttonId, eOpts);
		}
		
	},
	
	onContentDocumentButtonClicked : function(event, button, buttonId, eOpts) {		
		
	},
	
	onContentDocumentCancelButtonClicked : function(event, button, eOpts) {
		
		this.fireEvent('formaction', 'cancel', this);
		
	},
	
	onContentDocumentSubmitButtonClicked : function(event, button, eOpts) {
		
		this.fireEvent('formaction', 'success', this);
		
	}
	
	
});