Ext.define('Yamma.view.mails.gridactions.Archive', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},
	
	confirmMessage : i18n.t('view.mails.gridactions.archive.confirmMessage'),
	confirmTitle : i18n.t('view.mails.gridactions.archive.confirmTitle'),
	
	supportBatchedNodes : true,
	
	icon : Yamma.Constants.getIconDefinition('package').icon,
	tooltip : i18n.t('view.mails.gridactions.archive.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/archive',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_ARCHIVE,
	
	prepareBatchAction : function(records) {		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
	}
	
});