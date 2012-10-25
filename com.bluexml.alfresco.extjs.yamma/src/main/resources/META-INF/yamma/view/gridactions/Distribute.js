Ext.define('Yamma.view.gridactions.Distribute', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('lorry_go'),
		LABEL : 'Distribuer le document',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_DISTRIBUTE,
		ACTION_WS_URL : 'alfresco://bluexml/yamma/distribute'
	},
	
	getDistributeActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.Distribute.ICON.icon,
			tooltip : Yamma.view.gridactions.Distribute.LABEL,
			handler : this.onDistributeAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchDistributeAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchDistributeAction : function(record) {
		var userCanDistribute = record.get(Yamma.view.gridactions.Distribute.FIELD);
		return !!userCanDistribute;
	},
	
	onDistributeAction : function(grid, rowIndex, colIndex, item, e) {
		var record = grid.getStore().getAt(rowIndex);
		var documentNodeRef = this.getDocumentNodeRefRecordValue(record);
		this.distributeDocument(documentNodeRef);
		
		return false;
	},
	
	distributeDocument : function(documentNodeRef) {
		
		var me = this;
		
		var url = Bluexml.Alfresco.resolveAlfrescoProtocol(
			Yamma.view.gridactions.Distribute.ACTION_WS_URL
		);
		
		Bluexml.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : documentNodeRef
				}
			},
			
			function(jsonResponse) { /* onSuccess */
				me.refresh(); 
			}
		);	
		
	},
	
	getAssignedServiceRecordValue : function(record) {
		
	},
	
	getDocumentNodeRefRecordValue : function(record) {
		throw new Error('Should be redefined by the inclusive class');
	}	
});