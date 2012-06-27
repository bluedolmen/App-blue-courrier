Ext.define('Yamma.controller.DisplayViewController',{
	
	extend : 'Yamma.controller.MailSelectionAwareController',

	refs : [
	    {
	    	ref : 'displayView',
	    	selector : 'displayview'
	    }
	],	
	
	onNewMailSelected : function(newMailRecord) {
		
		var nodeRef = newMailRecord.get('nodeRef');
		if (!nodeRef) return;
		
		var typeShort = newMailRecord.get('typeShort');
		if (!typeShort) return;
		
		var mimetype = newMailRecord.get('mimetype');
		var title = newMailRecord.get('cm:title') || newMailRecord.get('cm:name') || 'preview';
		
		this.displayPreview(nodeRef, title, mimetype);
		this.callParent(arguments);
	},

	displayPreview : function(nodeRef, title, mimetype) {
		
		var nodeId = Bluexml.Alfresco.getNodeId(nodeRef);
		var displayView = this.getDisplayView();
		if (!displayView) return;
		
		var previewTab = displayView.child('#' + nodeId);
		
		if (!previewTab) {
			displayView.removeAll();
			var previewFrame = Ext.create('Bluexml.view.utils.PreviewFrame');
			previewTab = displayView.add({
				itemId : nodeId,
				title : title,
				layout : 'fit',
				items : [
					previewFrame
				]
			});
			previewFrame.load({
				nodeRef : nodeRef
			});
		} else {
			var previewFrame = previewTab.child('previewframe');
			if (previewFrame) previewFrame.refresh();
		}
		
		displayView.setActiveTab(previewTab);
		
	},	
	
	onClearSelectedMail : function() {
		var displayView = this.getDisplayView();
		if (displayView) displayView.removeAll();		
		this.callParent(arguments);		
	}	
	
});