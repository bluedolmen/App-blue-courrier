Ext.define('Yamma.view.header.Header', {
	
	extend : 'Ext.toolbar.Toolbar',
	requires : [
		'Bluexml.Alfresco',
		'Bluexml.model.Person',
		'Bluexml.utils.alfresco.button.UserButtonMenu',
		'Yamma.view.menus.AdvancedSearchMenu',
		'Yamma.view.windows.DropZone',
		'Yamma.view.header.OpenSearch'
	],
	
	alias : 'widget.yammaheader',
	
	items : [
	
		{
			xtype : 'userbuttonmenu'
		},
		{
			xtype : 'advancedsearchmenu'
		},
		{
			xtype : 'tbspacer',
			flex : 1
		},
		{
			xtype : 'opensearch'
		},
		{
			xtype : 'dropzone',
			width : 100,
			height : 50
		}
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
