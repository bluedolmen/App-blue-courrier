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
			xtype : 'userbuttonmenu'
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
		}
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
