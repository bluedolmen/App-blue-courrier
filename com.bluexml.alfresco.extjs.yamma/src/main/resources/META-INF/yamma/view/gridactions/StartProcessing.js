Ext.define('Yamma.view.gridactions.StartProcessing', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('pencil_go').icon,
	tooltip : 'Traiter le document',
	actionUrl : 'alfresco://bluexml/yamma/take-processing',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_PROCESS_DOCUMENT,
	supportBatchedNodes : true
		
});