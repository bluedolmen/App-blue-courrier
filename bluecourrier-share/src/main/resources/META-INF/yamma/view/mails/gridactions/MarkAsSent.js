Ext.define('Yamma.view.mails.gridactions.MarkAsSent', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('stamp').icon,
	tooltip : i18n.t('view.mails.gridactions.markassent.title'),
//	actionUrl : 'alfresco://bluedolmen/yamma/mark-as-sent',
//	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_MARK_AS_SENT,
	supportBatchedNodes : true,
	
	taskName : 'bcogwf:sendingTask',
	actionName : i18n.t('view.mails.gridactions.markassent.actionName')
	
});