Ext.define('Yamma.view.mails.gridactions.RefuseProcessing', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('pencil_cross').icon,
	tooltip : 'Refuser le traitement',
	
	confirmMessage : "Confirmez-vous le retour en distribution du courrier ?\n"
		+ "Cette opération est généralement réalisée lorsqu'une erreur de distribution a été effectuée."
	,
	confirmTitle : 'Refuser le tratement ?',
	
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