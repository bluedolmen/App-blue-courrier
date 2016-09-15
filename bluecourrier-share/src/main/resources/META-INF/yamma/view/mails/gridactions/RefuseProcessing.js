Ext.define('Yamma.view.mails.gridactions.RefuseProcessing', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('pencil_cross').icon,
	tooltip : i18n.t('view.mails.gridactions.refuseprocessing.tooltip'),//'Refuser le traitement',
	
	confirmMessage : i18n.t('view.mails.gridactions.refuseprocessing.confirmMessage'),
	confirmTitle : i18n.t('view.mails.gridactions.refuseprocessing.confirmTitle'),
	
	taskName : 'bcinwf:processingTask',
	actionName : 'Refuse',
	
//	discardIfOwner : true,
//	status : 'Not Yet Started',
	
	isAvailable : function(record) {
		
		var
			isAvailailable_ = this.callParent(arguments)
		;
		
		return isAvailailable_&& false === record.get(Yamma.utils.datasources.Documents.MAIL_HAS_REPLIES_QNAME);
		
	},
	
	supportBatchedNodes : false,
	
	prepareBatchAction : function(records) {
		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
		
	}	

		
});