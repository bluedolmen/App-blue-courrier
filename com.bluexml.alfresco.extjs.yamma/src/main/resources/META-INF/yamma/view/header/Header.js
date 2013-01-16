Ext.define('Yamma.view.header.Header', {
	
	extend : 'Ext.toolbar.Toolbar',
	requires : [
		'Bluexml.Alfresco',
		'Bluexml.model.Person',
		'Yamma.view.header.YammaUserButtonMenu',
		'Yamma.view.menus.AdvancedSearchMenu',
		'Yamma.view.header.OpenSearch'
	],
	
	alias : 'widget.yammaheader',
	
	items : [
 		{
			xtype : 'image',
			src : Alfresco.constants.URL_RESCONTEXT + 'yamma/resources/images/logo-yamma.png',
			height : 50,
			padding : '0 0 7 0'
		},
	
		
		{
			xtype : 'tbspacer',
			flex : 1
		},
		
		'-',
		{
			xtype : 'advancedsearchmenu'
		},
		{
			xtype : 'opensearch',
			width : 250,
			padding : '0 10 0 0'
		},
		
		'-',
		{
			xtype : 'yammauserbuttonmenu'
		}
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
