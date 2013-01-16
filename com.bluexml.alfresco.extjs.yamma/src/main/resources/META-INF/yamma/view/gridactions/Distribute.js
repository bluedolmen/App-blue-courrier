Ext.define('Yamma.view.gridactions.Distribute', {
	
	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('lorry_go').icon,
	tooltip : 'Distribuer le document',
	actionUrl : 'alfresco://bluexml/yamma/distribute',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_DISTRIBUTE,	
	supportBatchedNodes : true
	
});