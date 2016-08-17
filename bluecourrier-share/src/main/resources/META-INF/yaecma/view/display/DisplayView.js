Ext.define('Yaecma.view.display.DisplayView', 
{

	extend : 'Ext.container.Container',
	alias : 'widget.displayview',

    requires : [
		'Bluedolmen.view.utils.PreviewFrame',
		'Bluedolmen.utils.alfresco.forms.ViewFormFrame'
    ],
	
	title : i18n.t('widget.displayview.title'),
	plain : false,

	layout : 'fit',
	
	items : [
		{
			xtype : 'previewframe',
			flex : 2
		},
		{
			xtype : 'viewformframe',
			flex : 1
		}
	],
	
	load : function(nodeRef, mimeType) {
		
		var
			previewFrame = this.getPreviewFrame(),
			viewFormFrame = this.getViewFormFrame()
		;
		
		previewFrame.load({
			nodeRef : nodeRef,
			mimeType : mimeType
		});
		
		viewFormFrame.load({
			formConfig : {
				itemId : nodeRef
			}
		});
		
	},
	
	getPreviewFrame : function() {
		return this.query('previewframe')[0];
	},
	
	getViewFormFrame : function() {
		return this.query('viewformframe')[0];
	}
	
	
});