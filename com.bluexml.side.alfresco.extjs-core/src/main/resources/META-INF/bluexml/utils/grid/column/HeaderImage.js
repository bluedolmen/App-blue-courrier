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
		
		column.setIconCls = function(iconCls) {
			
			if (!iconCls) return;
			
			this.setText( 
				'<span' + 
				' class="' + iconCls + ' column-header-img"' +
				'>' +
				(this.text || '&#160;') + 
				'</span>'
			);
			
		};
		
		column.setIconCls(iconCls);
		
	}
	
	
});