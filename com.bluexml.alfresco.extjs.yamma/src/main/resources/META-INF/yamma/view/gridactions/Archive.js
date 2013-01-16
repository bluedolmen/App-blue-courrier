Ext.define('Yamma.view.gridactions.Archive', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluexml.utils.alfresco.grid.ConfirmedAction'
	},
	
	confirmMessage : "Confirmez-vous l'archivage du(des) document(s) ?</br>" +
							"Une fois le document archivé, le(s) document(s) ne sera(ont) plus disponible(s) dans l'application.",
	confirmTitle : 'Archiver ?',
	
	supportBatchedNodes : true,
	
	icon : Yamma.Constants.getIconDefinition('package').icon,
	tooltip : 'Archiver',
	actionUrl : 'alfresco://bluexml/yamma/archive',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_ARCHIVE,
	
	prepareBatchAction : function(records) {		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
	}
	
});