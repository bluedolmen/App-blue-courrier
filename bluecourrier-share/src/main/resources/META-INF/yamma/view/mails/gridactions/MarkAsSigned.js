Ext.define('Yamma.view.mails.gridactions.MarkAsSigned', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('text_signature_tick').icon,
	tooltip : i18n.t('view.mails.gridactions.markassigned.title'),
	actionUrl : 'alfresco://bluedolmen/yamma/mark-as-signed',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SIGNED,
	supportBatchedNodes : true,
	managerAction : true
	
});