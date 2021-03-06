Ext.define('Yamma.view.mails.gridactions.EndOutgoingProcessing', {
	
	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},		
	
	icon : Yamma.Constants.getIconDefinition('tick_go').icon,
	tooltip : i18n.t('view.mails.gridactions.endoutgoingprocessing.tooltip'),
	actionUrl : 'alfresco://bluedolmen/yamma/send-outbound',

	taskName : 'bcogwf:processingTask',
//	actionName : 'Validate',
	
	confirmTitle : i18n.t('view.mails.gridactions.endoutgoingprocessing.confirmTitle'),
	confirmMessage : i18n.t('view.mails.gridactions.endoutgoingprocessing.confirmMessage'),
	
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
			
			title : i18n.t('view.mails.gridactions.endoutgoingprocessing.initoutgoingvalidationdialog.title'),
			
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