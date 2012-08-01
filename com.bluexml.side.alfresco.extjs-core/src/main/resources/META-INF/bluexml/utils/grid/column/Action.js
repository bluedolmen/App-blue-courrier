Ext.define('Bluexml.utils.grid.column.Action', {

	extend : 'Ext.grid.column.Action',
	alias : 'widget.bluexmlactioncolumn',
	
	requires : [
		'Bluexml.utils.grid.column.HeaderImage'
	],
	
	tooltip : 'Actions', // if the plugin is applied on the containing table
	plugins : Ext.create('Bluexml.utils.grid.column.HeaderImage', {iconCls : 'icon-lightning'}),
	align : 'center',
	resizable : false,
	menuDisabled : true,
	sortable : false,
	stopSelection : true,
	
	constructor : function(config) {
		
		if (config && config.items) {
			var newWidth = config.items.length * 30;
			var maxWidth = config.maxWidth;
			config.width = maxWidth && newWidth > maxWidth ? maxWidth : newWidth;			
		}
		
		this.callParent(arguments);
	}

	
});