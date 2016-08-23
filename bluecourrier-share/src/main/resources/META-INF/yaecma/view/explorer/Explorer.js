Ext.define('Yaecma.view.explorer.Explorer', {

	extend : 'Ext.panel.Panel',
	alias : 'widget.explorer',
	
	requires : [
		'Yaecma.view.header.Header',
		'Yaecma.view.navigator.Navigator',
		'Yaecma.view.documents.DocumentsView'
	],
		
	layout : 'border',	
	
	items : [
		{
			xtype : 'yaecmaheader',
			height : 50,
			margin : 5,
			border : 1,
			
			region : 'north'
		},
		{
			xtype : 'navigator',
			showFolders : true,
			showFiles : false,
			flex : 1,
			split : true,
			margin : '0 0 5 5',
			
			region : 'west'
		},
		{
			xtype : 'documentsview',
			title : i18n.t('widget.explorer.items.documentsview.title'),
			header : false,
			hideHeaders : true,
			flex : 2,
			margin : '0 5 5 0',
			
			region : 'center'
		}
	]
	
});