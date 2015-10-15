Ext.define('Yaecma.view.header.Header', {
	
	extend : 'Ext.toolbar.Toolbar',
	
	requires : [
		'Bluedolmen.model.Person',
		'Yaecma.view.header.UserButtonMenu',
		'Yaecma.view.header.QuickSearch',
		'Yaecma.view.header.CollectionManager'
	],
	
	alias : 'widget.yaecmaheader',
	
	items : [
 		{
			xtype : 'image',
			src : Alfresco.constants.URL_RESCONTEXT + 'yaecma/resources/images/logo-yaecma.png',
			height : 50,
			padding : '0 0 3 0'
		},
	
//		{
//			xtype : 'container',
//			width : 150
//		},
		
		{
			xtype : 'tbspacer',
			flex : 1
		},
		
		{
			xtype : 'quicksearch',
			width : 250,
			padding : '5 5 5 5'
		},
 		{
			xtype : 'image',
			src : Yaecma.Constants.getIconDefinition('magnifier').icon,
			height : 16,
			padding : '0 5 0 5'
		},		
		
		{
			xtype : 'tbspacer',
			flex : 1
		},
		
		{
			xtype : 'collectionmanager'
		},
		
		'-',
		{
			xtype : 'yaecmauserbuttonmenu'
		}
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
