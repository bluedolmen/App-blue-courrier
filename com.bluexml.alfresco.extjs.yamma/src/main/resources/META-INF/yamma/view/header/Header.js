Ext.define('Yamma.view.header.Header', {
	
	extend : 'Ext.toolbar.Toolbar',
	requires : [
		'Bluexml.Alfresco',
		'Bluexml.model.Person',
		'Bluexml.utils.alfresco.button.UserButtonMenu'
	],
	
	alias : 'widget.yammaheader',
	
	items : [
	
		{
			xtype : 'userbuttonmenu'
		}		
		
	],
	
	defaults : {
		scale : 'medium'
	}	
	
});
