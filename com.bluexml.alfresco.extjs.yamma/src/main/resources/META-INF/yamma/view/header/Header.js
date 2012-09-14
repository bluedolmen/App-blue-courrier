Ext.define('Yamma.view.header.Header', {
	
	extend : 'Ext.toolbar.Toolbar',
	requires : [
		'Bluexml.Alfresco',
		'Bluexml.model.Person',
		'Bluexml.utils.alfresco.button.UserButtonMenu',
		'Yamma.view.menus.AdvancedSearchMenu',
		'Yamma.view.header.OpenSearch'
	],
	
	alias : 'widget.yammaheader',
	
	items : [
 		{
			xtype : 'image',
			src : Alfresco.constants.URL_RESCONTEXT + 'yamma/resources/images/YaMma.png',
			height : 50
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
			xtype : 'userbuttonmenu'
		}
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
