/**
 * Plugin for adding a context action-menu to tabs.
 */
Ext.define('Yamma.view.display.TabActionMenu', {
	
	alias : 'plugin.tabactionmenu',

	mixins : {
		observable : 'Ext.util.Observable'
	},

	/**
	 * @cfg {Boolean} Whether unavailable items should be hidden
	 */
	hideDisabled : true,
	
	//public
	constructor : function(config) {
		
		this.addEvents('aftermenu', 'beforemenu');
		this.mixins.observable.constructor.call(this, config);
		
	},

	init : function(tabpanel) {
		
		this.tabPanel = tabpanel;
		this.tabBar = tabpanel.down("tabbar");

		this.mon(this.tabPanel, {
			scope : this,
			afterlayout : this.onAfterLayout,
			single : true
		});
		
	},

	onAfterLayout : function() {
		
		this.mon(this.tabBar.el, {
			scope : this,
			contextmenu : this.onContextMenu,
//			delegate : 'div.x-tab' // delegate is replaced by 'element' in ExtJS 4.2
			element : 'div.x-tab'
		});
		
	},

	onBeforeDestroy : function() {
		
		Ext.destroy(this.menu);
		this.callParent(arguments);
		
	},

	/**
	 * @private
	 * @param {} event
	 * @param {} target
	 */
	onContextMenu : function(event, target) {
		
		var 
			me = this,
			menu = this.createMenu(),
			tab = me.tabBar.getChildByElement(target), 
			index = me.tabBar.items.indexOf(tab)
		;

		this.item = this.tabPanel.getComponent(index);

		menu.items.each(function(menuitem) {
			
			var 
				isAvailable = me.isAvailable(menuitem),
				hideDisabled = menuitem.hideDisabled === true || (menuitem.hideDisabled !== false && me.hideDisabled === true) 
			;
			
			menuitem.setDisabled(isAvailable !== true);
			menuitem.setVisible( !menuitem.isDisabled() || false === hideDisabled );
			
		});		

		event.preventDefault();
		this.fireEvent('beforemenu', menu, me.item, me);

		menu.showAt(event.getXY());
		
	},
	
	isAvailable : function(menuitem) {
		
		var isAvailable = menuitem.isAvailable;
		
		if (Ext.isFunction(isAvailable)) {
			isAvailable = menuitem.isAvailable.call(menuitem.scope || this.tabPanel, this.item);
		}
		
		return undefined === isAvailable ? true : isAvailable;
		
	},

	createMenu : function() {
		
		var me = this;

		if (!me.menu) {
			
			var items = this.items || [];

			me.menu = Ext.create('Ext.menu.Menu', {
				items : items,
				listeners : {
					hide : me.onHideMenu,
					scope : me
				}
			});
			
		}

		return me.menu;
	},

	onHideMenu : function() {
		
		var me = this;
//		me.item = null; // DO NOT set to NULL else this will be set BEFORE the action is executed
		me.fireEvent('aftermenu', me.menu, me);
		
	}

});