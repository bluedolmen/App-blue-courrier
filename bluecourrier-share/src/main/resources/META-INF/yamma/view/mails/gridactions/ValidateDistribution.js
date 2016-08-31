Ext.define('Yamma.view.mails.gridactions.ValidateDistribution', {
	
	extend : 'Yamma.view.mails.gridactions.Distribute',
	
//	icon : Yamma.Constants.getIconDefinition('lorry_accept').icon,
	icon : Yamma.Constants.getIconDefinition('bullet_ul_accept').icon,
	taskTitle : i18n.t('view.mails.gridactions.validateDistribution.taskTitle'),
	
	supportBatchedNodes : true,
	taskName : 'bcinwf:validatingTask',
	actionName : i18n.t('view.mails.gridactions.validateDistribution.actionName'),
	
	dialogConfig : {
		icon : Yamma.Constants.getIconDefinition('lorry_accept').icon,
		title : i18n.t('view.mails.gridactions.validateDistribution.dialog.title'),
		enableProcessSelection : false,
		enableMainRoleSelection : false		
	}
	
});