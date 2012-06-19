Ext.define('Bluexml.utils.grid.column.Action', {

	extend : 'Ext.grid.column.Action',
	alias : 'widget.bluexmlactioncolumn',
	
	tooltip : 'Actions', // if the plugin is applied on the containing table
	plugins : 'columnheaderimage',
	iconCls : 'icon-lightning',	
	align : 'center',
	resizable : false,
	menuDisabled : true,
	sortable : false,
	
	constructor : function(config) {
		
		if (config && config.items) {
			var newWidth = config.items.length * 30;
			var maxWidth = config.maxWidth;
			config.width = maxWidth && newWidth > maxWidth ? maxWidth : newWidth;
			
			// a trick to return a non-null and non-effective getClass function
			// if it is not overridden.
			// Thus it avoids using iconCls as a background image to actions.
			Ext.Array.forEach(config.items,function(item) {
				if (!item.getClass) 
					item.getClass = function() { return ' ';};
			});
		}
		
		this.callParent(arguments);
	}

	
});