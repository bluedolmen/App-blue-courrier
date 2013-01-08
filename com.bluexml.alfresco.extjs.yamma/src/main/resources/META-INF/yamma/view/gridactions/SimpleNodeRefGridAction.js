Ext.define('Yamma.view.gridactions.SimpleNodeRefGridAction', {
	
	extend : 'Yamma.view.gridactions.GridAction',
	
	getParameters : function(record) {
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		return [documentNodeRef];
	},
	
	performAction : function(documentNodeRef) {
		this.callParent();
		
		this.jsonPost({
			nodeRef : documentNodeRef
		});		
	}
	
});