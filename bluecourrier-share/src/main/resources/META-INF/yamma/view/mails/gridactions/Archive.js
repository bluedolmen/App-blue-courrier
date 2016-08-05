Ext.define('Yamma.view.mails.gridactions.Archive', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},
	
	confirmMessage : "Confirmez-vous l'archivage du(des) document(s) ?</br>" +
							"Une fois le document archivé, le(s) document(s) ne sera(ont) plus disponible(s) dans l'application.",
	confirmTitle : 'Archiver ?',
	
	supportBatchedNodes : true,
	
	icon : Yamma.Constants.getIconDefinition('package').icon,
	tooltip : 'Archiver',
	actionUrl : 'alfresco://bluedolmen/yamma/archive',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_ARCHIVE,
	
	prepareBatchAction : function(records) {		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
	}
	
});