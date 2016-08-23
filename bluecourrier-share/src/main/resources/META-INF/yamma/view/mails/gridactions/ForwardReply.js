Ext.define('Yamma.view.mails.gridactions.ForwardReply', {

	extend : 'Yamma.view.mails.gridactions.SimpleNodeRefGridAction',
	
	uses : [
		'Yamma.view.dialogs.ForwardDialog',
		'Bluedolmen.utils.alfresco.grid.GridUtils',
		'Yamma.utils.datasources.Documents'
	],
		
	icon : Yamma.Constants.getIconDefinition('group_go').icon,
	tooltip : i18n.t('view.mails.gridactions.forwardreply.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/forward-reply',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,	
		
	supportBatchedNodes : true,
	managerAction : true,
	
	isBatchAvailable : function(records, context) {
		
		var
			enclosingServices = Bluedolmen.utils.alfresco.grid.GridUtils.getCommons(records, Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			enclosingServicesNb = enclosingServices.getCount()
		;
		
		return (enclosingServicesNb > 1)
			? false
			: this.callParent(arguments)
		;
		
	},
	
	prepareBatchAction : function(records) {
		
		var
			me = this,
			enclosingServices = Bluedolmen.utils.alfresco.grid.GridUtils.getCommons(records, Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			enclosingServiceName = enclosingServices.keys[0],
			
			canSkipValidation = 
				Bluedolmen.utils.alfresco.grid.GridUtils.getCommons(
					records, 
					Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_SKIP_VALIDATION
				).get(false) === undefined 
		;
		
		this.forwardDialog = Ext.create('Yamma.view.dialogs.ForwardDialog', {
			
			initialService : enclosingServiceName,
			canSkipValidation : canSkipValidation,
			
			forward : function() {
				
				me.forwardDialog.hide();
				me.fireEvent('preparationReady', records, {} /* preparationContext */);
				
			}
			
		});
		
		this.forwardDialog.show();
		
	},	
	
	getAdditionalRequestParameters : function() {
		var
			approbe = this.forwardDialog.getApprobeStatus(),
			keepSending = this.forwardDialog.getKeepSendingStatus(),
			service = this.forwardDialog.getService()
		;
		
		return ({
			manager : this.usurpedManager || undefined,
			approbe : approbe,
			service : service,
			keepSending : keepSending
		});
	},	
	
	
	onSuccess : function() {
		this.callParent();
		
		if (null != this.forwardDialog) {
			this.forwardDialog.close();
			this.forwardDialog = null;
		}
	}
	
});