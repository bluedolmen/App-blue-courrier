Ext.define('Yamma.view.mails.gridactions.ForwardForValidation', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('tick_go').icon,
	tooltip : 'Transmettre pour validation',
	actionUrl : 'alfresco://bluedolmen/yamma/send-outbound',

	taskName : 'bcogwf:processingTask',
	actionName : 'Validate',
	
	supportBatchedNodes : true,	
	
	prepareBatchAction : function(records) {
		
		var 
			me = this,
			nodeRef
		;
		
		if (1 == records.length){
			
			nodeRef = records[0].get('nodeRef');
			
		}
		
		Ext.define('Yamma.view.mails.gridactions.ForwardForValidation.InitOutgoingValidationDialog', {
			
			extend : 'Yamma.view.dialogs.InitOutgoingValidationDialog',
			
			nodeRef : nodeRef,
			
			launch : function launch() {
				me.fireEvent('preparationReady', records);
				me.dialog.close();
			}
		
		}, function() {
			me.dialog = new this();
			me.dialog.show();
		});
		
	},	
	
	isAvailable : function(record, context) {
		
		if ('false' == Yamma.config.client['wf.outgoing.supervisor-validation']) return false;
		return this.callParent(arguments);
				
	},
	
	getAdditionalRequestParameters : function(preparationContext) {
		
		var actorsChain = this.dialog.getActorsChain();
		
		return (Ext.apply({
			actorsChain : actorsChain,
			skipValidation : false
		}, preparationContext));
		
	}	
	
	
});