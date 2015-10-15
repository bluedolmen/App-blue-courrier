Ext.define('Yamma.view.header.Header', {
	
	extend : 'Ext.toolbar.Toolbar',
	requires : [
		'Bluedolmen.Alfresco',
		'Bluedolmen.model.Person',
		'Yamma.view.header.YammaUserButtonMenu',
		'Yamma.view.menus.AdvancedSearchMenu',
		'Yamma.view.header.OpenSearch',
		'Ext.ux.TreePicker'
	],
	
	alias : 'widget.yammaheader',
	
	items : [
	         
 		{
			xtype : 'image',
			src : '/alfresco/service/bluedolmen/yamma/logo.png',
			height : 50,
			padding : '0 0 7 0'
		},
	
		'->',
		{
			xtype : 'advancedsearchmenu'
		},
		{
			xtype : 'opensearch',
			id : 'quicksearch',
			width : 250,
			padding : '0 10 0 0'
		},
		
		'->',
		{
			xtype : 'uploadbutton',
			scale : 'large'
		},
		{
			xtype : 'yammauserbuttonmenu'
		}
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
