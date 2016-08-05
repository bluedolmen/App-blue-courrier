Ext.define('Yaecma.view.documents.ParentsMenu', {

	extend : 'Ext.button.Button',
	alias : 'widget.parentsmenu',

	defaultIconCls : Yaecma.Constants.getIconDefinition('folder').iconCls, 
	
	disabled : true,

	menu : [],
	
	initComponent : function() {		
		this.callParent();
		
		this.addEvents('backto');
		this.enableBubble('backto');
		this.mon(this.menu, 'click', this._onMenuClick, this);
	},
	
	
	updatePath : function(pathParts) {

		function getPathPartText(pathPart) {
			return pathPart.name || pathPart.text || pathPart.label;
		}
		
		var 
			me = this,
			menu = this.menu
		;
		if (!menu) return;
		menu.removeAll();
		
		if (!pathParts) {
			this.disable();
			return;
		}
		
		if (!Ext.isArray(pathParts)) {
			Ext.Error.raise('IllegalArgumentException! The parents arguments has to be a valid array');
		}
		
		var 
			currentPart = pathParts[0],
			ancestorParts = pathParts.slice(1)
		;
		
		this.setText(getPathPartText(currentPart));
		
		if (0 == ancestorParts.length) {
			this.disable();
			return;
		} else {
			this.enable();
		}
		
		Ext.Array.forEach(ancestorParts, function(pathPart) {
			
			var
				nodeRef = pathPart.nodeRef,
				text = getPathPartText(pathPart)
			;
			
			menu.add({
				xtype : 'menuitem',
				text : 'root' == nodeRef ? '/' : text,
				iconCls : pathPart.iconCls || me.defaultIconCls,
				nodeRef : nodeRef
			});
			
		});
		
		if (this.isDisabled()) {
			this.enable();
		}
		
	},
	
	_onMenuClick : function(menu, item, event) {
		if (!item) return;
		
		this.fireEvent('backto', item.nodeRef);
	}
	
});