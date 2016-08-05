Ext.define('Yamma.view.mails.gridactions.StartDistribution', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',	
	
	icon : Yamma.Constants.getIconDefinition('lorry').icon,
	tooltip : 'Démarrer la distribution',
	
	taskName : 'bcinwf:pendingTask',
	actionName : 'Start',
	
	supportBatchedNodes : true
		
});