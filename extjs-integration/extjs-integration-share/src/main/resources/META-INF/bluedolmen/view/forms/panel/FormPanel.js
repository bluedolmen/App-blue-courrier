Ext.define('Bluedolmen.view.forms.panel.FormPanel', {

	extend : 'Ext.panel.Panel',
	
	layout : 'fit',
	delegatedFrame : null,
	
	loadNode : function(nodeRef, extraConfig) {
		
		var config = Ext.Object.merge(extraConfig, {
			formConfig : {
				itemId : nodeRef
			}
		});
		
		this.load(config);
		
	},
	
	load : function(config) {
		
		var me = this;
		
		if (undefined === config && this.delegatedFrame) {
			this.delegatedFrame.load(); // refresh the existing frame
			return;
		}
		
		config = config || {};
		this.updateTitle(config);
		if (this.delegatedFrame) this.clear();
		updateItems();
		if (!this.isVisible()) this.show(); 
		
		/*
		 * HELPER METHODS
		 */
		
		function updateItems() {
			
			var formxtype = config.formxtype || me.formxtype;
			if (!formxtype) return;
			
			var newItem = Ext.applyIf(
				{
					xtype : formxtype,
					border : 0,
					plain : true,
					autoScroll : false
				}, 
				config
			);
			me.updateItemConfig(newItem);
			
			if (me.delegatedFrame) {
				// Remove existing frame
				me.remove(me.delegatedFrame);
				me.delegatedFrame = null;
			}
			
			me.delegatedFrame = me.add(newItem);
			me.mon(me.delegatedFrame, 'formaction', me.onFormAction, me);
			me.delegatedFrame.load();
		}
		
		
	},
	
	refresh : function() {
		
		this.load();
		
	},
	
	clear : function() {
		
		this.mun(this.delegatedFrame, 'formaction', this.onFormAction, this);
		this.removeAll();
		this.delegatedFrame = null;
		
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
		
		
		function callImplicitActionHandler() {
			
			var handlerName = 'on' + Ext.String.capitalize(actionId);
			var handler = me[handlerName];
			if (undefined === handler) return;
			
			var shiftArguments = Ext.Array.slice(arguments, 1); 
			handler.apply(me, shiftArguments);
			return;
			
		}
		
		return true;
		
	},
	
	defaultFormActionBehaviour : function() {
	},
		
	onCancel : function() {
	},
	
	onSubmit : function() {
	},
	
	onSuccess : function() {
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
	}

});