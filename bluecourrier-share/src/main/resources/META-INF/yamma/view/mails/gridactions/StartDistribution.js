Ext.define('Yamma.view.mails.gridactions.StartDistribution', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('lorry').icon,
	tooltip : i18n.t('view.mails.gridactions.startdistribution.tooltip'),
	
	taskName : 'bcinwf:pendingTask',
	actionName :  'Start',
	
	supportBatchedNodes : true
		
});