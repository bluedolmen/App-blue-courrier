Ext.define('Yamma.view.mails.gridactions.EndOutgoingProcessing', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},		
	
	icon : Yamma.Constants.getIconDefinition('tick_go').icon,
	tooltip : 'Terminer le traitement',
	actionUrl : 'alfresco://bluedolmen/yamma/send-outbound',

	taskName : 'bcogwf:processingTask',
//	actionName : 'Validate',
	
	confirmTitle : "Envoyer sans validation ?",
	confirmMessage : "Le(s) document(s) va(vont) être envoyé(s) sans la validation d'une personne accréditée.</br>" +
		"Confirmez-vous l'envoi ?",
	
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
			
			title : 'Terminer le traitement',
			
			nodeRef : nodeRef,
			certifiable : Yamma.utils.SignatureUtils.isFeatureAvailable(),
			
			launch : function launch() {
				
				var actorsStore = this.actorsGrid.getStore();
				if (null != actorsStore && actorsStore.getCount() == 0) {
					me.mixins.confirmedAction.askConfirmation.call(me, records, {});
				}
				else {
					me.fireEvent('preparationReady', records);
					me.dialog.close();
				}
				
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
		
		var 
			actorsChain = this.dialog.getActorsChain(),
			signingActor = this.dialog.getSigningActor()
		;
		
		preparationContext = Ext.apply({
			actorsChain : actorsChain
		}, preparationContext);
		
		if (signingActor) {
			preparationContext.signingActor = signingActor;
		}
		
		return preparationContext;
		
	}	
	
	
});