Ext.define('Yamma.view.mails.gridactions.Distribute', {
	
	extend : 'Yamma.view.mails.gridactions.DeliveringAction',
	
	taskTitle : 'Distribution aux services',
	
	actionName : 'Deliver',
	
	dialogConfig : {
		enableMainRoleSelection : false
	},
	
	supportBatchedNodes : true,
	
	iconClsSuffix : 'group',
	
	prepareBatchAction : function(records) {
		
		var
			me = this,
			firstRecord,
			firstNodeRef = null,
			currentShares = [],
			firstMatchingTask, 
			operationDialog,
			rnb
		;
		
		if (!Ext.isIterable(records)) return;
		
		rnb = records.length;
		if (0 == rnb) return;
		
		firstRecord = records[0];
		firstNodeRef = firstRecord.get('nodeRef');
		firstMatchingTask = this.getFirstMatchingTask(firstRecord);
		currentShares = Yamma.utils.DeliveryUtils.getNodeShares(firstRecord);
		
		// Only one row selected or cannot distribute (only edit)
		if (1 == rnb || false === me.dialogConfig.enableDistribution ) {
			
			edit();
			return;
			
		}
		
		// Propose either the batch edition or the batch execution
		operationDialog = me.getOperationDialog({
			listeners : {
				click : function onClick(operation, button) {
					
					switch (operation) {
					case 'edit':
						edit();
					break;
					case 'distribute':
						batchDistribute();
					break;
					}
					
					operationDialog.close();
					
				}
			}
		});
		
		operationDialog.show();
			
		function edit() {
			
			var dialogConfig = {
				nodeRef : firstNodeRef,
				task  : firstMatchingTask,
				currentShares : currentShares
			};
			
			me.edit(records, dialogConfig);
			
		}
		
		function batchDistribute() {
			me.DeliveryDialog = null;
			me.fireEvent('preparationReady', records, {} /* preparationContext */);
		}
		
	},
	
	areRecordsCompatible : function(records) {
		
		if (!records || 1 == records.length) return true;
		
		// For now, just perform a simple checking on a perfect matching of the shares
		var
			shares = getShares(records[0])
		;
		
		function getShares(record) {
			return record.get(Yamma.utils.datasources.Documents.SHARES).join(',');
		}
		
		return Ext.Array.every(records, function(record) {
			var currentShares = getShares(record);
			return shares == currentShares;
		});
		
	},
	
	edit : function(records, dialogConfig) {
		
		var 
			me = this,
			msg
		;
		
		dialogConfig = Ext.apply({
			
			distribute : function() {
				
				me.DeliveryDialog.hide();
				me.fireEvent('preparationReady', records, {} /* preparationContext */);
				
			},
			
			save : function() {
				
				me.DeliveryDialog.hide();
				me.fireEvent('preparationReady', records, {
					saveOnly : true
				} /* preparationContext */);
				
			}
			
		}, dialogConfig, me.dialogConfig);
		
		if (!me.areRecordsCompatible(records)) {
			
			msg = 'Vous avez sélectionné plusieurs courriers avec des <b>affectations différentes</b>.<br>'
				+ 'Les valeurs affichées correspondent au <b>premier courrier</b> sélectionné.'
				+ '<i>Les changements effectués sur ce courrier seront appliqués à l\'ensemble des courriers sélectionnés.</i><br>'
				+ '<br>'
				+ 'Assurez-vous au préalable de <b>la cohérence</b> de l\'opération effectuée.'
			
			Ext.Msg.show({
				title : 'Edition par lots avancée',
				msg : msg,
				width : 320,
				buttons : Ext.Msg.OK,
				icon : Ext.Msg.WARNING,
				fn : actualEdit()
			});			
		}
		else {
			actualEdit();
		}
		
		function actualEdit() {
			me.DeliveryDialog = Ext.create('Yamma.view.mails.gridactions.Distribute.DeliveryDialog', dialogConfig);
			me.DeliveryDialog.show();
		}
		
	},
	
	getOperationDialog : function(config) {
		return Ext.create('Yamma.view.mails.gridactions.Distribute.Operationdialog', config);
	},
	
	getAdditionalRequestParameters : function(preparationContext) {
		
		if (null == this.DeliveryDialog) {
			return ({
				action : this.actionName
			});
		}
		
		var
			addedShares = this.DeliveryDialog.getAddedShares(),
			process = this.DeliveryDialog.getProcess()
		;
		
		return (Ext.apply({
			manager : this.usurpedManager || undefined,
			addedShares : Yamma.utils.DeliveryUtils.encodeShares(addedShares),
			action : this.actionName,
			validateDelivering : null != process ? !!process.validation : undefined,
			processKind : null != process ? process.kind : undefined
		}, preparationContext));
		
	},
	
	onSuccess : function() {
		
		this.callParent();
		
		if (null != this.DeliveryDialog) {
			this.DeliveryDialog.close();
			this.DeliveryDialog = null;
		}
		
	}
	
	
});

Ext.define('Yamma.view.mails.gridactions.Distribute.Operationdialog', {
	
	extend : 'Ext.window.Window',
	
	title: 'Traitement par lots',
	msg: "Cette opération vous permet d'<b>éditer</b> les valeurs <b>par lots</b> ou de <b>distribuer</b> selon les valeurs fixées précédemment.<br>"
			+ "<i>Attention!</i> Les valeurs actuelles (supposées combinées) ne sont pas présentées à l'utilisateur)"
			+ "<br><br>"
			+ "<i>Quelle opération voulez-vous effectuer ?</i>",
	width: 320,
//	height : 160,
	modal : true,
	
	cls: [
		Ext.baseCSSPrefix + 'message-box',
		Ext.baseCSSPrefix + 'hide-offsets'
	],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
	defaults : {
		width : '100%'
	},

	initComponent : function() {
		
		var me = this;
		
		this.items = [
			{
				xtype: 'displayfield',
				value: me.msg,
				cls: me.baseCls + '-text',
				margin : 7
			}  
		],
		
		this.dockedItems = [{
		    xtype: 'toolbar',
		    dock: 'bottom',
		    ui: 'footer',
		    items: ['->'].concat(me.getButtons() || []).concat([
	    		{
	    			xtype : 'button',
	    			text : 'Annuler',
	    			itemId : 'cancelButton',
	    			iconCls : Yamma.Constants.getIconDefinition('cancel').iconCls,
	    			handler : function() {
	    				me.close();
	    			}
	    		}
		    ])
		}];
		
		this.callParent();
	},
	
	getButtons: function() {
		
		return [
		        
    		{
    			xtype : 'button',
    			text : 'Éditer',
    			tooltip : 'Éditer toutes les valeurs des courriers sélectionnés',
    			iconCls : Yamma.Constants.getIconDefinition('group_edit').iconCls,
    			operation : 'edit',
    			handler : this._onClick,
    			scope : this
    		},
    		{
    			xtype : 'button',
    			text : 'Distribuer',
    			tooltip : 'Distribuer tous les courriers sélectionnés',
    			iconCls : Yamma.Constants.getIconDefinition('group_go').iconCls,
    			operation : 'distribute',
    			handler : this._onClick,
    			scope : this
    		}
		        
		];
		
	},	
	
	_onClick : function(button) {
		this.fireEvent('click', button.operation, button);		
	}
	
});

Ext.define('Yamma.view.mails.gridactions.Distribute.DeliveryDialog', {
	
	extend : 'Yamma.view.dialogs.MainDeliveryDialog',
			
	enableDistribution : true,
	enableAppliedChange : true,
	
	getButtons : function() {
		
		var
			me = this,
			buttons = this.callParent()
		;
		
		return [
	        { 
	        	xtype: 'button',
	        	itemId : 'distribute-button',
	        	text: 'Distribuer',
	        	icon : Yamma.Constants.getIconDefinition('group_go').icon,
	        	hidden : !this.enableDistribution,
	        	disabled : true,
	        	handler : function() {
					me.distribute();
	        	}
	        }
		].concat(buttons || []);

	},
	
	distribute : Ext.emptyFn,
	
	hasOngoingShares : function() {
		
//		return -1 != this.sharesStore.findBy(function(record) {
//			return !record.isApplied();
//		});
		
		return true;
		
	},
	
	onStateChanged : function(hasChanged, isValid) {
		
		this._setCanDistribute(this.hasOngoingShares() && isValid);
		this.callParent(arguments);
		
	},
	
	_setCanDistribute : function(canDistribute) {
		
		var distributeButton = this.queryById('distribute-button');
		distributeButton.setDisabled(!canDistribute);
		
	}
	
});