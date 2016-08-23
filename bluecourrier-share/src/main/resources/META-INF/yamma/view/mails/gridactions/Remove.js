Ext.define('Yamma.view.mails.gridactions.Remove', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('email_cross').icon,
	tooltip :  i18n.t('view.mails.gridactions.remove.tooltip'),
	
	supportBatchedNodes : false,
	
	taskName : 'bcinwf:pendingTask',
	actionName : i18n.t('view.mails.gridactions.remove.actionName'),
	
	confirmMessage : i18n.t('view.mails.gridactions.remove.confirmMessage'),
	confirmTitle : i18n.t('view.mails.gridactions.remove.confirmTitle'),
	
//	isAvailable : function(record, context) {
//		
//		var
//			isAvailailable_ = this.callParent(arguments),
//			permissions = record.get(Yamma.utils.datasources.Documents.PERMISSIONS)
//		;
//		return true == permissions['Delete'] && isAvailailable_;
//		
//	},
	
	prepareBatchAction : function(records) {
		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
		
	}	
	
});
