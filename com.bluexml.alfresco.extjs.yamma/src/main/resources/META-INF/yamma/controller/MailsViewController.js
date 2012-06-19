Ext.define('Yamma.controller.MailsViewController', {
	extend : 'Ext.app.Controller',
	
	refs : [
	    {
			ref : 'editDocumentView',
	    	selector : 'editdocumentview'
	    },
	    
	    {
	    	ref : 'displayView',
	    	selector : 'displayview'
	    }
	],
	
	init: function() {
		
		this.control({
			'mailsview': {
				selectionchange : this.onSelectionChange,
				itemclick : this.onItemClick
			}
		});
		
	},
	
	onSelectionChange : function(selectionModel, selectedRecords, eOpts) {
		
		if (!selectedRecords || !Ext.isArray(selectedRecords) || selectedRecords.length == 0) return;
		var firstSelectedRecord = selectedRecords[0];
		
		this.displayItem(firstSelectedRecord);
	},
	
	onItemClick : function(view, record, item) {
		//this.displayItem(record);
	},
	
	displayItem : function(record) {
		var nodeRef = record.get('nodeRef');
		if (!nodeRef) return;
		
		var typeShort = record.get('typeShort');
		if (!typeShort) return;
		
		var mimetype = record.get('mimetype');
		var title = record.get('cm:title') || record.get('cm:name') || 'preview';
		
		this.displayEditForm(nodeRef, typeShort);
		this.displayPreview(nodeRef, title, mimetype);
	},
	
	
	displayEditForm : function(nodeRef, typeShort) {
		
		var editDocumentView = this.getEditDocumentView();
		if (!editDocumentView) return;
		
		editDocumentView.load({
			nodeRef : nodeRef 		
		});		    	
		
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
		
		
	}
	
});