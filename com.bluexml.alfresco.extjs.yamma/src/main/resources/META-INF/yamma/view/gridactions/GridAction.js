Ext.define('Yamma.view.gridactions.GridAction', {
	
	extend : 'Bluexml.utils.alfresco.grid.GridAction',
	
	requires : [
		'Yamma.utils.datasources.Documents'
	],	
	
	mixins : {
		jsonPostAction : 'Bluexml.utils.alfresco.grid.JsonPostAction'	
	},
	
	showBusy : true,
	
	getDocumentNodeRefRecordValue : function(record) {
		return record.get(Yamma.utils.datasources.Documents.DOCUMENT_NODEREF_QNAME);	
	},
	
	onSuccess : function() {
		this.mixins.jsonPostAction.onSuccess.call(this);
		this.refreshGrid();
	}	
	
});