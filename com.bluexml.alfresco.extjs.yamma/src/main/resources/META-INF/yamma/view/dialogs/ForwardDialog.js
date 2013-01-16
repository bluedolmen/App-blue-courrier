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
		ICON : Yamma.Constants.getIconDefinition('arrow_double_right').icon,
		ICON_CANCEL : Yamma.Constants.getIconDefinition('cancel').icon
	},
	
	title : 'Transmettre',
	height : 500,
	width : 400,
	modal : true,
	
	layout : 'vbox',
	
	defaults : {
		width : '100%',
		border : 1
	},
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initialService : null,
	canChangeApprobation : true,
	
	initComponent : function() {
		
		var
			me = this
		;
				
		this.icon = Yamma.view.dialogs.ForwardDialog.ICON;
		this.items = [
			{
				xtype : 'servicesview',
				itemId : 'services-tree',
				region : 'center',
				headerPosition : 'top',
				initialSelection : this.initialService,
				margin : 10,
				flex : 1,
				listeners : {
					'viewready' : function() {
						var servicesView = me._getServicesView();
						servicesView.setService(me.initialService); 
					},
					'selectionchange' : function() {
						me._validateOperation();
					}
				}
			},
			{
				xtype : 'checkbox',
				region : 'bottom',
				height : '30px',
				itemId : 'approbe-checkbox',
				boxLabel : "Apposer un visa d'approbation",
				boxLabelAlign : 'after',
				checked : true,
				disabled : true,
				margin : '0 10 10 10'
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
		this._setNeedsApprobe(true);
		
	},
	
	getApprobeStatus : function() {
		var approbeCheckBox = this.queryById('approbe-checkbox');
		return approbeCheckBox.getValue();
	},
	
	getService : function() {
		var servicesView  = this._getServicesView();
		return servicesView.getService();
	},	
	
	forward : Ext.emptyFn,
	
	show: function() {
				
		this._validateOperation();
		this.callParent();
		
	},

	/**
	 * @private
	 */
	_setNeedsApprobe : function(doNeedSignature, disable) {
		
		var approbeCheckBox = this.queryById('approbe-checkbox');
		approbeCheckBox.setValue(doNeedSignature);
		
		approbeCheckBox.setDisabled(this.canChangeApprobation && (true === disable) );
		
	},	
	
	/**
	 * @private
	 */
	_getServicesView : function() {
		return this.down('servicesview');
	},
		
	
	/**
	 * Disable the forward button if the operation is not valid w.r.t. the available data
	 * @private
	 */
	_validateOperation : function(operation) {
		
		var 
			me = this
		;
				
		function isValid() {	
			
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