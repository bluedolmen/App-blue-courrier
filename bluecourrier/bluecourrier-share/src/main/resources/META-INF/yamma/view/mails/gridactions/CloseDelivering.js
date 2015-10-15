Ext.define('Yamma.view.mails.gridactions.CloseDelivering', {

	extend : 'Yamma.view.mails.gridactions.DeliveringAction',
	
	taskTitle : i18n.t('view.mails.actions.CloseDelivering.tooltip'),
	
	iconClsSuffix : 'tick',
	
	supportBatchedNodes : true,

	taskName : 'bcinwf:deliveringTask',
	actionName : 'Done'
	
});