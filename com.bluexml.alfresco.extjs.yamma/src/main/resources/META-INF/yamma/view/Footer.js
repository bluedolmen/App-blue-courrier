Ext.define('Yamma.view.Footer', {
	
	statics : {
		BRITAIR_LOGO_URL : '/share/res/britair/resources/images/britair-logo.png'
	},
	
	extend : 'Ext.container.Container',
	alias : 'widget.yammafooter',
	
	requires : [
		'Ext.Img',
		'Ext.toolbar.Spacer'
	],
	
	layout : {
		type : 'hbox',
		align : 'middle'
	},
	
	height : 50,
	
	defaults : {
		border : 0,
		plain : true
	},
	
	items : [
		
		{
			xtype : 'image',
			src : Alfresco.constants.URL_RESCONTEXT + 'yamma/resources/images/bluexml-ps-logo-small.png',
			height : 50
		},
		{
			xtype : 'tbspacer',
			flex : 1
		},
		{
			xtype : 'image',
			src : Alfresco.constants.URL_RESCONTEXT + 'yamma/resources/images/Alfresco_logo_transparent.png',
			height : 50,
			width : 50
		}
	]
	
	
});