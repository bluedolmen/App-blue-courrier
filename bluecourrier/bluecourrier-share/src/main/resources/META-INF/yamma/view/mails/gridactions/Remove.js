Ext.define('Yamma.view.mails.gridactions.Remove', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('email_cross').icon,
	tooltip : 'Supprimer le courrier',
	
	supportBatchedNodes : false,
	
	taskName : 'bcinwf:pendingTask',
	actionName : 'remove',
	
	confirmMessage : "Confirmez-vous la suppression du courrier ?",
	confirmTitle : 'Supprimer ?',
	
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
