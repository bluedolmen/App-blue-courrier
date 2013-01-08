Ext.define('Yamma.view.gridactions.Archive', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	uses : [
		'Bluexml.windows.ConfirmDialog'
	],
	
	statics : {
		CONFIRM_MESSAGE : "Confirmez-vous l'archivage du document ?</br>" +
							"Une fois le document archivé, le document ne sera plus disponible dans l'application.",
		CONFIRM_TITLE : 'Archiver ?'
	},
	
	icon : Yamma.Constants.getIconDefinition('package').icon,
	tooltip : 'Archiver',
	actionUrl : 'alfresco://bluexml/yamma/archive',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_ARCHIVE,	
	
	performAction : function(documentNodeRef) {
		
		var me = this;
		
		Bluexml.windows.ConfirmDialog.FR.askConfirmation({
			title : Yamma.view.gridactions.Archive.CONFIRM_TITLE,
			msg : Yamma.view.gridactions.Archive.CONFIRM_MESSAGE,
			onConfirmation : function() {
				me.jsonPost({
					nodeRef : documentNodeRef
				});							
			}
		});
		
	}
	
});