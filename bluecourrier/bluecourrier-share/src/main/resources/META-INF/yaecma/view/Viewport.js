Ext.define('Yaecma.view.Viewport', {
	
	extend : 'Ext.container.Viewport',
	
	requires : [
		'Ext.layout.container.Border',
		'Yaecma.view.explorer.Explorer'
	],
	
	layout : 'fit',
	
	
	items : [
//		{
//			id : 'explorer-app',
//			layout : 'fit',
//			items : {
//				xtype : 'explorer'
//			}
//		}
	{
		xtype : 'explorer',
		plain : true,
		border : 0
	}
	]	
	
});