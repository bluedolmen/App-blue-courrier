Ext.define('Yamma.view.mails.gridactions.ValidateDistribution', {
	
	extend : 'Yamma.view.mails.gridactions.Distribute',
	
//	icon : Yamma.Constants.getIconDefinition('lorry_accept').icon,
	icon : Yamma.Constants.getIconDefinition('bullet_ul_accept').icon,
	taskTitle : 'Valider la distribution',
	
	supportBatchedNodes : true,
	taskName : 'bcinwf:validatingTask',
	actionName : 'Accept',
	
	dialogConfig : {
		icon : Yamma.Constants.getIconDefinition('lorry_accept').icon,
		title : 'Valider la distribution',
		enableProcessSelection : false,
		enableMainRoleSelection : false		
	}
	
});