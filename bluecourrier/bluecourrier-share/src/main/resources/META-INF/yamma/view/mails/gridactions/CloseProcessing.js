Ext.define('Yamma.view.mails.gridactions.CloseProcessing', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',
	
	icon : Yamma.Constants.getIconDefinition('thumb_up_go').icon,
	tooltip : 'Terminer le traitement',
	supportBatchedNodes : true,
	
	taskName : 'bcinwf:processingTask',
	actionName : 'Done',
	
	status : 'In Progress'
	
});