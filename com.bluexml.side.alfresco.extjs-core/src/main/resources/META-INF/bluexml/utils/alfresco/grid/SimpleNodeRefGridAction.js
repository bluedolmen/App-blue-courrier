Ext.define('Bluexml.utils.alfresco.grid.SimpleNodeRefGridAction', {
	
	getParameters : function(record) {
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		return [documentNodeRef];
	},
	
	performAction : function(documentNodeRef) {
		this.jsonPost({
			nodeRef : documentNodeRef
		});		
	}
	
});