Ext.define('Bluexml.utils.IconDefinition', {	
	
	getBaseIconPath : function() {
		
		if (undefined === this.BASE_ICON_PATH) {
			Ext.Error.raise('The BASE_ICON_PATH property has to be defined');
		};
		
		return this.BASE_ICON_PATH;
		
	},
	
	getIconDefinition : function(iconName, size) {
		
		var 
			baseIconPath = this.getBaseIconPath()
		;
		if (!/.*\/$/.test(baseIconPath)) {
			baseIconPath += '/';
		}
		
		return {
			icon : 
				baseIconPath +
				(undefined !== size ? size + (Ext.isNumber(size) ? 'px' : '') + '/' : '') +
				iconName + 
				'.png',
			iconCls : 'icon-' + iconName
		};
		
	},
	
	
	asIconPath : function(iconDefinition) {
		
		if (!iconDefinition) return null;		
		return iconDefinition.icon || null;
		
	}
	
});
