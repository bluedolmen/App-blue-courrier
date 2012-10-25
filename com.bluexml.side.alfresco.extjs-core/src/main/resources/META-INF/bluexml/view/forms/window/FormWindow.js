Ext.define('Bluexml.view.forms.window.FormWindow', {

	extend : 'Ext.window.Window',
	
	width : window.innerWidth ? window.innerWidth * 0.75 : 900,
	height : window.innerHeight || 450,
	layout : 'fit',
	headerPosition : 'left',
	delegatedFrame : null,

	constructor : function(config) {
		
		config = config || {};
		this.callParent([config]);
		
	},
	
	load : function(config) {
		
		var me = this;
		
		if (undefined === config && this.delegatedFrame) {
			this.delegatedFrame.load(); // refresh the existing frame
			return;
		}
		
		config = config || {};
		this.updateTitle(config);		
		updateItems();
		if (!this.isVisible()) this.show(); 
		
		/*
		 * HELPER METHODS
		 */
		
		function updateItems() {
			
			var formxtype = config.formxtype || me.formxtype;
			if (!formxtype) return;
			
			var newItem = {
				xtype : formxtype,
				border : 0,
				plain : true,
				autoScroll : false
			};
			Ext.applyIf(newItem, config);
			me.updateItemConfig(newItem);
			
			if (me.delegatedFrame) {
				// Remove existing frame
				me.mun(me.delegatedFrame, 'formaction', me.onFormAction, me);
				me.remove(me.delegatedFrame);
				me.delegatedFrame = null;
			}
			
			me.delegatedFrame = me.add(newItem);
			me.mon(me.delegatedFrame, 'formaction', me.onFormAction, me);
			me.delegatedFrame.load();
		}
		
	},
	
	updateTitle : function(config) {
		var title = config.title || this.title;
		if (!title) return;
		
		var itemId = config.itemId;
		if (!itemId) {
			this.setTitle(title);
			return;
		}
		
		var itemDescription = this.getItemDescription(itemId);
		if (!itemDescription) return;
		
		var itemTitle = itemDescription.title;
		if (null == itemTitle) return;
		
		this.setTitle(title + ' ' + itemTitle);
		this.setIconCls(itemDescription.iconCls);		
	},
	
	getItemDescription : function(itemId) {
		return null;
	},	
	
	updateItemConfig : function(config) {
		// do nothing but maybe overridden
	},
	
	/**
	 * Dispatch on a particular handler given the actionId and the provided
	 * (other) arguments
	 * <p>
	 * This method is able to dispatch implicitely on the actionId by callling
	 * the this.on[ActionId]Action method where [ActionId] is the value of the
	 * 'actionId' parameter
	 * 
	 * @param {}
	 *            actionId
	 * @return {Boolean}
	 */
	onFormAction : function(actionId) {
		
		var me = this;
		if (null == actionId || '' === actionId) return false;
		
		this.defaultFormActionBehaviour();		
		callImplicitActionHandler.apply(this, arguments);
		
		return true;
		
		function callImplicitActionHandler() {
			
			var handlerName = 'on' + Ext.String.capitalize(actionId);
			var handler = me[handlerName];
			if (undefined === handler) return;
			
			var shiftArguments = Ext.Array.slice(arguments, 1); 
			handler.apply(me, shiftArguments);
			return;
			
		}
	},
	
	defaultFormActionBehaviour : function() {
	},
		
	onCancel : function() {
		this.close();
	},
	
	onSubmit : function() {
		this.hide();
	},
	
	onSuccess : function() {
		this.close();
	},
	
	onError : function(message) {
		
		Ext.MessageBox.show({
			
			title : 'Problème durant l\'opération',
			msg : 
				'Un problème est survenu durant l\'exécution :<br/>' + 
				'<i>' + message + '</i>',	
			buttons : Ext.MessageBox.OK,
			icon : Ext.MessageBox.ERROR
			
		});
		
		this.close();
	}

});