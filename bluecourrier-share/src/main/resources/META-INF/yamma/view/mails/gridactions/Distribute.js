Ext.define('Yamma.view.mails.gridactions.Distribute', {
	
	extend : 'Yamma.view.mails.gridactions.DeliveringAction',
	
	taskTitle : i18n.t('view.mails.gridactions.distribute.tasktitle'),
	
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
			
			msg = i18n.t('view.mails.gridactions.distribute.compatiblerecords.msg');
			
			Ext.Msg.show({
				title : i18n.t('view.mails.gridactions.distribute.compatiblerecords.title'),
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
	
	title:  i18n.t('view.mails.gridactions.distribute.operationdialog.title'),
	msg: i18n.t('view.mails.gridactions.distribute.operationdialog.msg'),
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
	    			text : i18n.t('view.mails.gridactions.distribute.operationdialog.buttons.cancel'),
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
    			text : i18n.t('view.mails.gridactions.distribute.operationdialog.buttons.edit'),
    			tooltip : i18n.t('view.mails.gridactions.distribute.operationdialog.buttons.edit-tooltip'),
    			iconCls : Yamma.Constants.getIconDefinition('group_edit').iconCls,
    			operation : 'edit',
    			handler : this._onClick,
    			scope : this
    		},
    		{
    			xtype : 'button',
    			text : i18n.t('view.mails.gridactions.distribute.operationdialog.buttons.distribute'),
    			tooltip : i18n.t('view.mails.gridactions.distribute.operationdialog.buttons.distribute-tooltip'),
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
	        	text: i18n.t('view.mails.gridactions.distribute.operationdialog.buttons.distribute'),
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