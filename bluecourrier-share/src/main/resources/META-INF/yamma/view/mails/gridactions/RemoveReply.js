Ext.require([
	'Yamma.utils.ReplyUtils'
], function() {

Ext.define('Yamma.view.mails.gridactions.RemoveReply', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	mixins : {
		confirmedAction : 'Bluedolmen.utils.alfresco.grid.ConfirmedAction'
	},	
	
	icon : Yamma.Constants.getIconDefinition('email_cross').icon,
	tooltip : i18n.t('view.mails.gridactions.removereply.confirmMessage'),
	
	supportBatchedNodes : false,
	
	discardRefreshOnSuccess : true, // signal an operation instead
	
	taskName : 'bcogwf:processingTask',
	actionName : i18n.t('view.mails.gridactions.removereply.actionName'),
	
	confirmMessage : i18n.t('view.mails.gridactions.removereply.confirmMessage'),
	confirmTitle : i18n.t('view.mails.gridactions.removereply.confirmTitle'),
	
	isAvailable : function(record, context) {
		
		var
			isAvailailable_ = this.callParent(arguments),
			permissions = record.get(Yamma.utils.datasources.Documents.PERMISSIONS)
		;
		return true == permissions['Delete'] && isAvailailable_;
		
	},
	
	prepareBatchAction : function(records) {
		
		this.mixins.confirmedAction.askConfirmation.call(this, records, {});
		
	},	
	
	onSuccess : function(jsonResponse, context) {
		
		this.callParent(arguments);
		
		var 
			grid = this.grid,
			nodeRefs = this.getContextNodeRefs(context)
		;		
		
		grid.fireEvent(
			'operation', 
			'delete', 
			nodeRefs
		);
		
	}		
	
});

});