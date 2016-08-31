Ext.define('Yamma.view.mails.itemactions.ShareDocumentAction', {
	
	extend : 'Bluedolmen.utils.alfresco.grid.ContextMenuAction',
	
	statics : {
		actionUrl : 'alfresco://bluedolmen/yamma/share-with'
	},
	
	uses : [
		'Yamma.view.mails.gridactions.Distribute'
	],
	
	text : i18n.t('view.mails.itemaction.sharedocument.text'),//'Partager',
	
	iconCls : Yamma.Constants.getIconDefinition('hand-share').iconCls,
	
	isAvailable : true,
	
	execute : function(record, item, view) {
		
		var 
			me = this,
			nodeRef = record.get('nodeRef'),
			taskRef = record.get('taskRef'),
			permissions = record.get(Yamma.utils.datasources.Documents.PERMISSIONS),
			shareSelectionWindow = Ext.create('Yamma.view.mails.itemactions.ShareDocumentAction.ShareDialog', {
				nodeRef : nodeRef,
				taskRef : taskRef,
				share : share,
				disableContributorRole : !(permissions && true === permissions.Write)
			});
		;
		
		shareSelectionWindow.show();
		
		function share() {
			
			var 
				url = Bluedolmen.Alfresco.resolveAlfrescoProtocol(Yamma.view.mails.itemactions.ShareDocumentAction.actionUrl),
				shares = shareSelectionWindow.getShares(),
				encodedShares = Yamma.view.mails.gridactions.Distribute.encodeShares(shares)
			;
			
			Bluedolmen.Alfresco.jsonPost({
				
				url : url,
				
				dataObj : {
					nodeRef : nodeRef,
					shares : encodedShares
				},
				
				onSuccess : function onSuccess(jsonResponse) {
					shareSelectionWindow.close();
				}
			
			});
			
		}
		
	}
	
});

Ext.define('Yamma.view.mails.itemactions.ShareDocumentAction.ShareDialog', {
	
	extend : 'Yamma.view.dialogs.MainDeliveryDialog',
	
	title : i18n.t('view.mails.itemaction.sharedocument.dialog.title'),//'Partager',
	icon : Yamma.Constants.getIconDefinition('hand-share').icon,
	
	enableShareServiceSelection : false,
	enableProcessSelection : false,
	enableMainServiceChange : false,
	enableSave : false,
	
	modal : true,
	
	getButtons : function() {
		
		var
			me = this,
			buttons = this.callParent()
		;
		
		return [
	        { 
	        	xtype: 'button',
	        	itemId : 'share-button',
	        	text: i18n.t('view.mails.itemaction.sharedocument.dialog.buttons.share'),
	        	icon : Yamma.Constants.getIconDefinition('hand-share').icon,
	        	handler : function() {
					me.share();
	        	}
	        }
		].concat(buttons || []);

	},
	
	share : Ext.emptyFn,
	
	validateOperation : function(somethingHasChanged) {
		
		this._setCanShare(somethingHasChanged);
		this.callParent(arguments);
		
	},
	
	_setCanShare : function(canShare) {
		var shareButton = this.queryById('share-button');
		shareButton.setDisabled(!canShare);
	}	
	
});