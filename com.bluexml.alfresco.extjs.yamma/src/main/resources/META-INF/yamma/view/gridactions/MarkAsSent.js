Ext.define('Yamma.view.gridactions.MarkAsSent', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('stamp').icon,
	tooltip : 'Marquer comme envoyé',
	actionUrl : 'alfresco://bluexml/yamma/mark-as-sent',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SENT	
	
});