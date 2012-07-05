Ext.define('Bluexml.utils.grid.column.HeaderImage', {

	alias : 'plugin.columnheaderimage',
	
	config : {
		iconCls : null
	},
	
	constructor : function(config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	
	init : function(column) {
		
		var iconCls = column.iconCls || this.getIconCls();
		if (!iconCls) return;
		
		column.text = 
			'<span' + 
			' class="' + iconCls + ' column-header-img"' +
			'>' +
			(column.text || '&#160;') + 
			'</span>';
		
	}
	
});