Ext.define('Yamma.view.gridactions.SendOutbound', {

	requires : [
		'Yamma.utils.datasources.Documents'
	],
	
	uses : [
		'Bluexml.windows.ConfirmDialog'
	],
	
	statics : {
		ICON : Yamma.Constants.getIconDefinition('email_go'),
		LABEL : 'Envoyer',
		FIELD : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SEND_OUTBOUND,
		ACTION_WS_URL : 'alfresco://bluexml/yamma/send-outbound'
	},
	
	CONFIRM_MESSAGE : "Confirmez-vous l'envoi du document au destinataire ?</br>" +
						"Tout envoi devra être validé par une personne accréditée.",
	CONFIRM_TITLE : 'Envoyer ?',
	
	getSendOutboundActionDefinition : function() {
		
		var me = this;
		
		return	{
			icon : Yamma.view.gridactions.SendOutbound.ICON.icon,
			tooltip : Yamma.view.gridactions.SendOutbound.LABEL,
			handler : this.onSendOutboundAction,
			scope : this,
			getClass : function(value, meta, record) {
				if (!me.canLaunchSendOutboundAction(record)) return (Ext.baseCSSPrefix + 'hide-display');
				return '';
			}
		};
			
	},
	
	canLaunchSendOutboundAction : function(record) {
		var userCanSendOutbound = record.get(Yamma.view.gridactions.SendOutbound.FIELD);
		return userCanSendOutbound;
	},
	
	onSendOutboundAction : function(grid, rowIndex, colIndex, item, e) {
		
		var 
			me = this,
			record = grid.getStore().getAt(rowIndex),
			documentNodeRef = this.getDocumentNodeRefRecordValue(record)
		;
		
		askConfirmation();
		
		function askConfirmation () {
			
			Bluexml.windows.ConfirmDialog.FR.askConfirmation({
				title : me.CONFIRM_TITLE,
				msg : me.CONFIRM_MESSAGE,
				onConfirmation : Ext.bind(me.sendOutbound, me, [documentNodeRef])
			});
			
		};
		
		return false;
	},
	
	sendOutbound : function(documentNodeRef) {
		
		var 
			me = this,
			url = Bluexml.Alfresco.resolveAlfrescoProtocol(
				Yamma.view.gridactions.SendOutbound.ACTION_WS_URL
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