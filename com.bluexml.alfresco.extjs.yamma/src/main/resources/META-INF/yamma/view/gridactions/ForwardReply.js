Ext.define('Yamma.view.gridactions.ForwardReply', {

	extend : 'Yamma.view.gridactions.SimpleNodeRefGridAction',
	
	uses : [
		'Yamma.view.dialogs.ForwardDialog',
		'Bluexml.utils.alfresco.grid.GridUtils'
	],
		
	icon : Yamma.Constants.getIconDefinition('group_go').icon,
	tooltip : 'Transmettre au service',
	actionUrl : 'alfresco://bluexml/yamma/forward-reply',
	availabilityField : Yamma.utils.datasources.Documents.DOCUMENT_USER_CAN_VALIDATE,	
		
	supportBatchedNodes : true,
	managerAction : true,
	
	isBatchAvailable : function(records, context) {
		
		var
			enclosingServices = Bluexml.utils.alfresco.grid.GridUtils.getCommons(records, Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
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
			enclosingServices = Bluexml.utils.alfresco.grid.GridUtils.getCommons(records, Yamma.utils.datasources.Documents.ENCLOSING_SERVICE),
			enclosingServiceName = enclosingServices.keys[0].name,
			
			canSkipValidation = 
				Bluexml.utils.alfresco.grid.GridUtils.getCommons(
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
	
	performServerRequest : function(nodeRefs) {
		
		var
			approbe = this.forwardDialog.getApprobeStatus(),
			service = this.forwardDialog.getService()
		;
		
		this.jsonPost({
			nodeRef : nodeRefs,
			manager : this.usurpedManager || undefined,
			approbe : approbe,
			service : service
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