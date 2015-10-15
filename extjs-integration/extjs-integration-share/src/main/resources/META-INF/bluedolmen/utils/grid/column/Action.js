Ext.define('Bluedolmen.utils.grid.column.Action', {

	extend : 'Ext.grid.column.Action',
	alias : 'widget.alfrescoactioncolumn',
	
//	requires : [
//		'Bluedolmen.utils.grid.column.HeaderImage'
//	],
	
	tooltip : 'Actions', // if the plugin is applied on the containing table
//	plugins : Ext.create('Bluedolmen.utils.grid.column.HeaderImage', {iconCls : 'icon-lightning'}),
	header : '<i>Actions</i>',
	align : 'center',
	resizable : false,
	menuDisabled : true,
	sortable : false,
	groupable : false,
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
