Ext.define('Bluexml.windows.PreviewWindow', {

	extend : 'Ext.window.Window',
	alias : 'widget.previewwindow',
	
	requires : [
		'Bluexml.view.utils.PreviewFrame'
	],
	
	layout : 'fit',
	items : [
		{
			xtype : 'previewframe'
		}
	],
	
	/**
	 * @private
	 * @type String 
	 */
	nodeRef : null,
	
	/**
	 * @private
	 * @type String
	 */
	mimeType : null,
	
	constructor : function(config) {
		
		var 
			nodeRef = config.nodeRef;
			mimeType = config.mimeType;
		if (!nodeRef) {
			Ext.Error.raise('IllegalArgumentException! The nodeRef config property is mandatory!');
		}
		
		this.nodeRef = nodeRef;
		this.mimeType = mimeType || null;
		
		delete config.nodeRef;
		delete config.mimeType;
		
		this.callParent([config]);
	},
	
	
	
	initComponent : function() {		
		this.callParent(arguments);
		
		this.child('previewframe').load({
			nodeRef : this.nodeRef,
			mimeType : this.mimeType
		});
	},
	
	renderTo : Ext.getBody()
	
});