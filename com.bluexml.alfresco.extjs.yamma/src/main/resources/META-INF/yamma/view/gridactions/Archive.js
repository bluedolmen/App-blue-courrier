Ext.define('Yamma.view.gridactions.Archive', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.windows.ConfirmDialog'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('package'),
		LABEL : 'Archiver',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_ARCHIVE,
		ACTION_WS_URL : 'alfresco://bluexml/yamma/archive', 
		CONFIRM_MESSAGE : "Confirmez-vous l'archivage du document ?</br>" +
							"Une fois le document archivé, le document ne sera plus disponible dans l'application.",
		CONFIRM_TITLE : 'Archiver ?'
	},
	
	getArchiveActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.Archive.ICON.icon,
			tooltip : Yamma.view.gridactions.Archive.LABEL,
			handler : this.onArchiveAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchArchiveAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchArchiveAction : function(record) {
		var userCanArchive = record.get(Yamma.view.gridactions.Archive.FIELD);
		return userCanArchive;
	},
	
	onArchiveAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			me = this,
			record = grid.getStore().getAt(rowIndex),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		askConfirmation();
		
		function askConfirmation () {
			
			Bluexml.windows.ConfirmDialog.FR.askConfirmation({
				title : Yamma.view.gridactions.Archive.CONFIRM_TITLE,
				msg : Yamma.view.gridactions.Archive.CONFIRM_MESSAGE,
				onConfirmation : Ext.bind(me.archive, me, [documentNodeRef])
			});
			
		};
		
		return false;
	},
	
	archive : function(documentNodeRef) {
		
		var 
			me = this,
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				Yamma.view.gridactions.Archive.ACTION_WS_URL
			)
		;		

		Bluexml.Alfresco.jsonPost(
			{
				url : url,
				dataObj : {
					nodeRef : documentNodeRef
				}
			},
			
			function(jsonResponse) { /* onSuccess */
				me.refresh(); 
			}
		);	
		
	},
	
	getDocumentNodeRefRecordValue : function(record) {
		throw new Error('Should be redefined by the inclusive class');
	}	
	
});