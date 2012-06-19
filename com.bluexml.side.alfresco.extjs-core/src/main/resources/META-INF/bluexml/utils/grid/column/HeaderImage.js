Ext.define('Bluexml.utils.grid.column.HeaderImage', {

	alias : 'plugin.columnheaderimage',
	
	init : function(column) {
		
		var iconCls = column.iconCls;
		if (!iconCls) return;
		
		column.text = 
			'<span' + 
			' class="' + iconCls + ' column-header-img"' +
			'>' +
			(column.text || '&#160;') + 
			'</span>';
		
	}
	
});