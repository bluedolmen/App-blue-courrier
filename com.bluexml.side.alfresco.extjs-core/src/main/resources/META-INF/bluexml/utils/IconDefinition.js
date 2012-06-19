Ext.define('Bluexml.utils.IconDefinition', {
	
	getIconDefinition : function(iconName) {
		
		if (undefined === this.BASE_ICON_PATH) {
			Ext.Error.raise('The BASE_ICON_PATH property has to be defined');
		};
		
		return {
			icon : this.BASE_ICON_PATH + iconName + '.png',
			iconCls : 'icon-' + iconName
		};
	}
	
});
