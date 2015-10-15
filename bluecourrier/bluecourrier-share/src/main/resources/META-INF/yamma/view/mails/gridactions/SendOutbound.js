Ext.define('Yamma.view.mails.gridactions.SendOutbound', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	tooltip : 'Transmettre pour envoi postal',
	actionUrl : 'alfresco://bluedolmen/yamma/send-outbound',
	
	supportBatchedNodes : true,
	
	taskName : 'bcogwf:processingTask',
	actionName : 'Send Without Validation',
	
	confirmTitle : "Envoyer sans validation ?",
	confirmMessage : "Le(s) document(s) va(vont) être envoyé(s) sans la validation d'une personne accréditée.</br>" +
		"Confirmez-vous l'envoi ?",
		
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
	
	title : 'Envoyer sans validation.',
	height : 200,
	width : 300,
	modal : true,
	
	icon : Yamma.Constants.getIconDefinition('email_go').icon,
	
	layout : 'vbox',
	
	defaults : {
		width : '100%',
		border : 1
	},
	
	msg : '<em>Votre document va être envoyé sans validation.</em><br/>' + 
		  'Voulez-vous certifier votre document à l\'aide d\'une signature électronique ?',
	
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
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button',
		        	itemId : 'certify-button',
		        	text: 'Certifier',
		        	icon : Yamma.Constants.getIconDefinition('rosette').icon,
		        	handler : function() {
						me.certify();
		        	}
		        },
		        { 
		        	xtype: 'button',
		        	itemId : 'send-button',
		        	text: 'Envoyer',
		        	icon : this.icon,
		        	handler : function() {
						me.forward();
		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: 'Annuler',
		        	icon : Yamma.Constants.getIconDefinition('cancel').icon,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];

		this.callParent();
		
	},
	
	certify : function() {
		
	},
	
	send : function() {
		
	}
	
	
});