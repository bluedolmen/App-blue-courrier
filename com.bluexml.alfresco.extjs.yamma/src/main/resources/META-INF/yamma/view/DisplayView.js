Ext.define('Yamma.view.DisplayView', {

	extend : 'Ext.tab.Panel',
	alias : 'widget.displayview',

	requires: [
        'Bluexml.utils.tab.Tool'
    ],
    
    uses : [
		'Bluexml.view.utils.PreviewFrame'    
    ],
	
	title : 'Prévisualisation des fichiers',
	layout : 'fit',
	//frame : true,
	//border : false,
	plain : true,
	
    plugins: [
        Ext.create('Bluexml.utils.tab.Tool', {
            ptype : 'itstabtool',
            items: [
            	{
	            	xtype : 'button',
	            	id : 'attachedFilesButton',
	            	iconCls: 'icon-attach',
	            	disabled : true
	            },
            	{
	            	xtype : 'button',
	            	id : 'replyFilesButton',
	            	iconCls: 'icon-email',
	            	disabled : true
	            }
			]
        })
    ],
    
	addPreviewTab : function(nodeRef, mimetype, tabConfig, setActive) {
		
		setActive = !!setActive;
		var nodeId = Bluexml.Alfresco.getNodeId(nodeRef);
		
		var previewFrame = Ext.create('Bluexml.view.utils.PreviewFrame');
		var previewTab = this.add(
			Ext.apply({
				itemId : nodeId,
				title : '',
				layout : 'fit',
				items : [
					previewFrame
				]
			}, tabConfig)
		);
		
		previewFrame.load({
			nodeRef : nodeRef,
			mimetype : mimetype
		});
		
		if (setActive) this.setActiveTab(previewTab);
		return previewTab;
		
	},
	
	getPreviewTab : function(nodeRef) {
		
		if (!nodeRef) return null;
		
		var nodeId = Bluexml.Alfresco.getNodeId(nodeRef);
		var previewTab = this.child('#' + nodeId);
		return previewTab;
		
	},
	
	getPreviewFrame : function(arg) {
		
		var previewTab = Ext.isString(arg) ? this.getPreviewTab(arg /* nodeRef */) : arg;
		if (!previewTab) return null;
		
		return previewTab.child('previewframe');
		
	},	
	
	clear : function() {
		
		this.removeAll();
		
	}
	
});