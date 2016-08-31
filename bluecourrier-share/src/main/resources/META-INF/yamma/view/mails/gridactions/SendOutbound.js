Ext.define('Yamma.view.mails.gridactions.SendOutbound', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},
	
	uses : [
	    'Yamma.utils.SignatureUtils'
	],
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	tooltip :  i18n.t('view.mails.gridactions.sendoutbound.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/send-outbound',
	
	supportBatchedNodes : true,
	
	taskName : 'bcogwf:processingTask',
	actionName :  i18n.t('view.mails.gridactions.sendoutbound.actionName'),
	
	confirmTitle : i18n.t('view.mails.gridactions.sendoutbound.confirmTitle'),
	confirmMessage : i18n.t('view.mails.gridactions.sendoutbound.confirmMessage'),
		
	checkUserCanSkipValidation : false,
	
	isAvailable : function(record, context) {
		
		var
			userCanSkipValidation = record.get(Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SKIP_VALIDATION)
		;
		
		return (
			(!this.checkUserCanSkipValidation ||  userCanSkipValidation) &&
			this.callParent(arguments)
		);
				
	},
	
	prepareBatchAction : function(records) {
		
//		var
//			dialog = Ext.create('Yamma.view.mails.gridactions.SendOutbound.Dialog')
//		;
//		
//		dialog.show();
//		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
		
	},	
	
	getAdditionalRequestParameters : function() {
		
		return ({
			skipValidation : true
		});
		
	}	
	
});

Ext.define('Yamma.view.mails.gridactions.SendOutbound.Dialog', {

	extend : 'Ext.window.Window',
	alias : 'widget.sendoutbounddialog',
	
	requires : [
	],
	
	title : i18n.t('view.mails.gridactions.sendoutbound.dialog.title'),
	height : 200,
	width : 300,
	modal : true,
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	
	layout : 'vbox',
	
	defaults : {
		width : '100%',
		border : 1
	},
	
	msg : i18n.t('view.mails.gridactions.sendoutbound.dialog.msg'),
	
	headerPosition : Yamma.utils.Preferences.getPV(Yamma.utils.Preferences.PREFERED_HEADER_POSITION),
	
	renderTo : Ext.getBody(),
	
	initComponent : function() {
		
		var
			me = this
		;
				
		this.items = [
			{
				xtype : 'displayfield',
				itemId : 'msg',
				flex : 1,
				margin : 10,
				value : this.msg || ''
			}
		];
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: Ext.Array.clean([
		        { xtype: 'component', flex: 1 },
		        (Yamma.utils.SignatureUtils.isFeatureAvailable() ? 
			        { 
			        	xtype: 'button',
			        	itemId : 'certify-button',
			        	text: i18n.t('view.mails.gridactions.sendoutbound.dialog.buttons.certify'),
			        	icon : Yamma.Constants.getIconDefinition('rosette').icon,
			        	handler : function() {
							me.certify();
			        	}
			        } : null
			    ),
		        { 
		        	xtype: 'button',
		        	itemId : 'send-button',
		        	text: i18n.t('view.mails.gridactions.sendoutbound.dialog.buttons.send'),
		        	icon : this.icon,
		        	handler : function() {
						me.forward();
		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: i18n.t('view.mails.gridactions.sendoutbound.dialog.buttons.cancel'),
		        	icon : Yamma.Constants.getIconDefinition('cancel').icon,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ])
		}];

		this.callParent();
		
	},
	
	certify : function() {
		
	},
	
	send : function() {
		
	}
	
	
});