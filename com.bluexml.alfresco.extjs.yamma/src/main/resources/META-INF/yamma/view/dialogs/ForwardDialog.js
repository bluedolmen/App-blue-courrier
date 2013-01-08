Ext.define('Yamma.view.dialogs.ForwardDialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.forwarddialog',
	
	requires : [
		'Yamma.view.services.ServicesView',
		'Ext.form.FieldContainer',
		'Ext.form.RadioGroup',
		'Ext.form.field.Radio',
		'Ext.form.field.Checkbox',
		'Ext.form.field.ComboBox',
		'Ext.ux.form.field.TreePicker',
		'Ext.form.FieldSet'
	],
	
	statics : {
		Operation : {
			SEND : 'send',
			SIGN : 'sign',
			FORWARD : 'forward'
		},
		ICON : Yamma.Constants.getIconDefinition('arrow_double_right').icon,
		ICON_CANCEL : Yamma.Constants.getIconDefinition('cancel').icon,
		SERVICE_DATASOURCE_URL : 'alfresco://bluexml/yamma/service?service={service}'
	},
	
	title : 'Transmettre',
	height : 400,
	width : 600,
	modal : true,
	
	layout : 'border',
	
	defaults : {
		height : '100%',
		border : 1
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initialService : null,
	canChangeApprobation : true,
	hasSignableReplies : false,
	
	initComponent : function() {
		
		var
			me = this
		;
				
		this.icon = Yamma.view.dialogs.ForwardDialog.ICON;
		this.items = [
			{
				
				itemId : 'left-panel',
				region : 'center',
				layout : 'vbox',
				margin : 10,
				defaults : {
					labelAlign : 'top',
					margin : '5 0 5 15'
				},
				items : [
					{
						xtype : 'fieldset',
						title : 'Opération',
						layout : 'vbox',
						collapsible : false,
						items : [
							{
								xtype : 'radiogroup',
								itemId : 'operation-radio',
								columns : 1,
								width : 200,
								vertical : true,
								
								listeners : {
									'change' : function() {
										me._validateOperation();
									}
								},
								items : [
									{
										boxLabel : 'Envoi postal',
										name : 'operation',
										inputValue : Yamma.view.dialogs.ForwardDialog.Operation.SEND,
										handler : function(checkbox, checked) {
											if (checked) {
												me._setNeedsSignature(true, true /* disabled */);
											}
										}
									},
									{
										itemId : 'signature-radio',
										boxLabel : 'Signature',
										name : 'operation',
										inputValue : Yamma.view.dialogs.ForwardDialog.Operation.SIGN,
										hidden : true,
										handler : function(checkbox, checked) {
											if (checked) {
												me._setNeedsSignature(true, true /* disabled */);
											}
										}
									},
									{
										boxLabel : 'Transmission',
										name : 'operation',
										inputValue : Yamma.view.dialogs.ForwardDialog.Operation.FORWARD,
										handler : function(checkbox, checked) {
											
											var servicesView = me._getServicesView();
											servicesView[checked ? 'expand' : 'collapse']();
											
											if (checked) {
												me._setNeedsSignature(true);
											}
											
										}
									}
								]						
							}
						]
						
					},
					{
						xtype : 'combobox',
						fieldLabel : 'Réaliser en tant que',
						itemId : 'identity-combobox',
						displayField : 'displayName',
						valueField : 'userName',
						forceSelection : true
					},
					{
						xtype : 'checkbox',
						itemId : 'approbe-checkbox',
						boxLabel : "Apposer un visa d'approbation",
						boxLabelAlign : 'after',
						checked : true,
						disabled : true
					}
				]
				
			},
			{
				xtype : 'servicesview',
				itemId : 'services-tree',
				region : 'east',
				headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
				collapseMode : 'header',
				collapsed : true,
				collapseDirection : Ext.Component.COLLAPSE_LEFT,
				initialSelection : this.initialService,
				margin : 10,
				width : '50%',
				listeners : {
					'viewready' : function() {
						var servicesView = me._getServicesView();
						servicesView.setService(me.initialService); 
					},
					'selectionchange' : function() {
						me._validateOperation();
					}
				}
			}
		];
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button',
		        	itemId : 'forward-button',
		        	text: 'Transmettre',
		        	icon : Yamma.view.dialogs.ForwardDialog.ICON,
		        	handler : function() {
						me.forward();
		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: 'Annuler',
		        	icon : Yamma.view.dialogs.ForwardDialog.ICON_CANCEL,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];
		
		
		this.callParent();
		
		var operationRadio = this.queryById('operation-radio');
		operationRadio.setValue({
			operation : 'send' 
		});
		operationRadio.checkChange();
		
	},
	
	getApprobeStatus : function() {
		var approbeCheckBox = this.queryById('approbe-checkbox');
		return approbeCheckBox.getValue();
	},
	
	getService : function() {
		var servicesView  = this._getServicesView();
		return servicesView.getService();
	},
	
	getOperation : function() {
		var operationRadio = this.queryById('operation-radio');
		return operationRadio.getValue().operation;
	},
	
	getManagerUserName : function() {
		var 
			identityComboBox = this.queryById('identity-combobox'),
			currentValue = identityComboBox.getValue() 
		;
		
		return currentValue;
	},
	
	forward : Ext.emptyFn,
	
	show: function() {
		
		var 
			me = this,
			url = Bluexml.Alfresco.resolveAlfrescoProtocol( 
				Yamma.view.dialogs.ForwardDialog.SERVICE_DATASOURCE_URL
					.replace(/\{service\}/,me.initialService)
			)
		;
		
		me._setDataLoading(true);
		me.callParent();
		
		Bluexml.Alfresco.jsonRequest({
			url : url,
			onSuccess : function onSuccess(jsonResponse) {
				me._initData(jsonResponse);
				me._validateOperation();
				me._setDataLoading(false);				
			}
		});
				
	},
	
	/**
	 * @private
	 */
	_getServicesView : function() {
		return this.down('servicesview');
	},
		
	/**
	 * @private
	 */
	_setNeedsSignature : function(doNeedSignature, disable) {
		
		var approbeCheckBox = this.queryById('approbe-checkbox');
		approbeCheckBox.setValue(doNeedSignature);
		
		approbeCheckBox.setDisabled(this.canChangeApprobation && (true === disable) );
		
	},
	
	/**
	 * @private
	 * @param {Boolean} isLoading
	 */
	_setDataLoading : function(isLoading) {
		
		var leftPanel = this.queryById('left-panel');
		leftPanel.setLoading(isLoading);
		
	},
	
	/**
	 * @private
	 * @param {Object} jsonResponse
	 */
	_initData : function(jsonResponse) {
		
		var 
			serviceManagersComboBox = this.queryById('identity-combobox'),
			serviceManagersData = jsonResponse.serviceManagers,
			serviceManagersStore = Ext.create('Ext.data.Store', {
				fields : [
					{ name : "userName", type : "string" },
					{ name : "displayName", type : "string" }
				],
				data : serviceManagersData
			}),
			firstManagerValue = serviceManagersStore.getAt(0),
			
			signatureRadio = this.queryById('signature-radio'),
			isSigningService = jsonResponse.isSigningService
		;
		
		serviceManagersComboBox.bindStore(serviceManagersStore);
		if (firstManagerValue) {
			serviceManagersComboBox.setValue(firstManagerValue);
		}
		
		// 
		signatureRadio.setVisible(isSigningService && this.hasSignableReplies);
		
	},
	
	/**
	 * Disable the forward button if the operation is not valid w.r.t. the available data
	 * @private
	 */
	_validateOperation : function(operation) {
		
		var 
			me = this
		;
		
		operation = operation || this.getOperation();
		if (Ext.isArray(operation)) return; // intermediate evaluation => not relevant
		
		function isValid() {
			
			var managerUserName = me.getManagerUserName();
			if (!managerUserName) return false;
			
			if (Yamma.view.dialogs.ForwardDialog.Operation.FORWARD != operation) return true;
			
			var selectedService = me.getService();
			if (selectedService == null) return false;
			
			if (me.initialService == selectedService) return false;
			
			return true;
		}
		
		this._setCanForward(isValid());
	},
	
	_setCanForward : function(canForward) {
		var forwardButton = this.queryById('forward-button');
		forwardButton.setDisabled(!canForward);
	}
	
});