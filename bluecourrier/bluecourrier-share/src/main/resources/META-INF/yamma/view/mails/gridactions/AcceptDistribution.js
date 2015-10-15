Ext.define('Yamma.view.mails.gridactions.AcceptDistribution', {

	extend : 'Yamma.view.mails.gridactions.SimpleTaskRefGridAction',	

	icon : Yamma.Constants.getIconDefinition('lorry_accept').icon,
	tooltip : 'Valider la distribution',
	supportBatchedNodes : true,
	
	taskName : 'bcwfincoming:Validating'
//	actionName : 'distribute'
	
});