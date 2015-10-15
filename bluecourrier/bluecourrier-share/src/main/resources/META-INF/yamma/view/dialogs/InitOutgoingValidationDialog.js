Ext.define('Yamma.view.dialogs.InitOutgoingValidationDialog', {

	extend : 'Yamma.view.dialogs.OutgoingValidationDialog',
	alias : 'widget.initoutgoingvalidationdialog',
	
	title : 'Lancer la validation',
	iconCls : Yamma.Constants.getIconDefinition('tick_go').iconCls,

	commentable : false,
	
	initComponent : function() {
		
		this.callParent();
		this.propertiesForm.setVisible(false);
		
	},
	
//	height : 400,
//	width : 400,
	
//	getItemsDefinition : function() {
//		
//		var
//			itemsDefinition = this.callParent()
//		;
//		
//		return [
//			{
//				xtype : 'panel',
//				region : 'center',
//				layout : 'vbox',
//				plain : true,
//			    title: false, //'Chaîne de validation',				
//				defaults : {
//					width : '100%',
//					margin : 0
//				},
//				items : [
//					this.personCombo,
//					this.actorsGrid
//				]
//			}
//		];		
//		
//		return itemDefinitions;
//		
//	},
	
	/**
	 * @protected
	 */
	getDockedItemsDefinition : function() {
		
		var me = this;

		return [{
		    xtype: 'toolbar',
		    dock: 'bottom',		

		    ui: 'footer',
		    defaults: { minWidth: Ext.panel.Panel.minButtonWidth },
		    items: [
		        { xtype: 'component', flex: 1 },
		        { 
		        	xtype: 'button',
		        	itemId : 'launch-button',
		        	text: 'Lancer',
		        	icon : Yamma.Constants.getIconDefinition('tick_go').icon,
		        	handler : function() {
						me.launch();
		        	}
		        },
		        { 
		        	xtype: 'button', 
		        	itemId : 'cancel-button',
		        	text: 'Annuler',
		        	icon : Yamma.Constants.getIconDefinition('cross').icon,
		        	handler : function() {
		        		me.close();
		        	}
		        }
		    ]
		}];
		
	},
	
	launch : Ext.emptyFn,
	
	/**
	 * Disable the forward button if the operation is not valid w.r.t. the available data
	 * @private
	 */
	_validateOperation : function(operation) {
		
		var 
			me = this,
			canLaunch_ = canLaunch()
		;
				
		function canLaunch() {
			
			var actorsStore = me.actorsGrid.getStore();
			if (null == actorsStore) return false;
			
			return actorsStore.getCount() > 0;
			
		}
		
		this._setCanLaunch(canLaunch_);
		
	},
	
	_setCanLaunch : function(canDistribute) {
		
		var launchButton = this.queryById('launch-button');
		launchButton.setDisabled(!canDistribute);
		
	}
	
	
});